import Foundation
import StoreKit
import WebKit

/// The web game receives ownership only from StoreKit-verified, non-consumable entitlements.
@MainActor
final class StoreKitBridge: NSObject, WKScriptMessageHandlerWithReply, WKNavigationDelegate {
    weak var webView: WKWebView?
    static let prefix = "com.justinsapps.jackthestreets"
    static let cars = ["volt", "apex", "phantom", "nova", "circuit", "rocket", "f458"]
    static let upgrades = ["engine", "security", "tyresarmour"]
    static let productIDs: Set<String> = Set(cars.flatMap { car in
        ["\(prefix).car.\(car)"] + upgrades.map { "\(prefix).upgrade.\(car).\($0)" }
    })
    private var pending: [UInt64: StoreKit.Transaction] = [:]
    private var updateTask: Task<Void, Never>?

    override init() {
        super.init()
        updateTask = Task { [weak self] in
            for await result in StoreKit.Transaction.updates {
                guard let self else { return }
                guard case .verified(let transaction) = result,
                      Self.productIDs.contains(transaction.productID) else { continue }
                self.pending[transaction.id] = transaction
                await self.notifyEntitlements()
            }
        }
    }
    deinit { updateTask?.cancel() }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard message.frameInfo.isMainFrame,
              let url = webView?.url, url.isFileURL,
              let root = Bundle.main.resourceURL?.appendingPathComponent("Game"),
              url.standardizedFileURL.path.hasPrefix(root.standardizedFileURL.path + "/"),
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else {
            replyHandler(nil, "This purchase request is not from the bundled game.")
            return
        }
        Task { @MainActor in
            do {
                switch action {
                case "products":
                    let products = try await Product.products(for: Array(Self.productIDs))
                    replyHandler(["products": products.map { product -> [String: Any] in
                        ["id": product.id, "price": product.displayPrice,
                         "currency": product.priceFormatStyle.currencyCode]
                    }], nil)
                case "entitlements":
                    replyHandler(await entitlements(), nil)
                case "restore":
                    try await AppStore.sync()
                    replyHandler(await entitlements(), nil)
                case "purchase":
                    guard let id = body["id"] as? String, Self.productIDs.contains(id) else {
                        replyHandler(nil, "Unknown product."); return
                    }
                    if id.contains(".upgrade.") {
                        let components = id.components(separatedBy: ".upgrade.")[1].components(separatedBy: ".")
                        let current = await entitlements()
                        let owned = current["ids"] as? [String] ?? []
                        guard let car = components.first, owned.contains("\(Self.prefix).car.\(car)") else {
                            replyHandler(nil, "Purchase this car before upgrading it."); return
                        }
                    }
                    guard let product = try await Product.products(for: [id]).first else {
                        replyHandler(nil, "This product is not available in the App Store yet."); return
                    }
                    switch try await product.purchase() {
                    case .success(let verification):
                        guard case .verified(let transaction) = verification,
                              transaction.productID == id, transaction.revocationDate == nil else {
                            replyHandler(nil, "Apple could not verify the purchase."); return
                        }
                        pending[transaction.id] = transaction
                        // JavaScript acknowledges only after ownership was delivered and persisted.
                        replyHandler(["status": "purchased", "entitlements": await entitlements()], nil)
                    case .pending:
                        replyHandler(["status": "pending"], nil)
                    case .userCancelled:
                        replyHandler(["status": "cancelled"], nil)
                    @unknown default:
                        replyHandler(["status": "unavailable"], nil)
                    }
                case "acknowledge":
                    let ids = body["transactions"] as? [String] ?? []
                    for raw in ids {
                        if let id = UInt64(raw), let transaction = pending.removeValue(forKey: id) {
                            await transaction.finish()
                        }
                    }
                    replyHandler(["ok": true], nil)
                default:
                    replyHandler(nil, "Unsupported store action.")
                }
            } catch {
                replyHandler(nil, error.localizedDescription)
            }
        }
    }

    private func entitlements() async -> [String: Any] {
        var ids: [String] = []
        for await result in StoreKit.Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  Self.productIDs.contains(transaction.productID),
                  transaction.revocationDate == nil,
                  transaction.productType == .nonConsumable else { continue }
            ids.append(transaction.productID)
        }
        // Recover purchases interrupted before the web game could acknowledge delivery.
        for await result in StoreKit.Transaction.unfinished {
            guard case .verified(let transaction) = result,
                  Self.productIDs.contains(transaction.productID) else { continue }
            pending[transaction.id] = transaction
        }
        return ["ids": Array(Set(ids)).sorted(), "transactions": pending.keys.map(String.init)]
    }
    private func notifyEntitlements() async {
        let payload = await entitlements()
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        _ = try? await webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('store-entitlements',{detail:\(json)}));")
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url,
              let root = Bundle.main.resourceURL?.appendingPathComponent("Game") else {
            decisionHandler(.cancel); return
        }
        decisionHandler(url.isFileURL && url.standardizedFileURL.path.hasPrefix(root.standardizedFileURL.path + "/") ? .allow : .cancel)
    }
}
