import SwiftUI
import WebKit

struct GameWebView: UIViewRepresentable {
    func makeCoordinator() -> StoreKitBridge { StoreKitBridge() }
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        if let endpoint = Bundle.main.object(forInfoDictionaryKey: "OpenMapWebSocketURL") as? String,
           !endpoint.isEmpty, let data = try? JSONSerialization.data(withJSONObject: endpoint, options: .fragmentsAllowed),
           let encoded = String(data: data, encoding: .utf8) {
            configuration.userContentController.addUserScript(WKUserScript(
                source: "window.JACK_ONLINE_URL = \(encoded);", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.userContentController.addScriptMessageHandler(
            context.coordinator, contentWorld: .page, name: "premiumStore")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = .black
        view.scrollView.isScrollEnabled = false
        view.navigationDelegate = context.coordinator
        context.coordinator.webView = view
        if let game = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game") {
            view.loadFileURL(game, allowingReadAccessTo: game.deletingLastPathComponent())
        }
        return view
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
