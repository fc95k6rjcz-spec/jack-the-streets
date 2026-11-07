import SwiftUI

@main
struct JackTheStreetsApp: App {
    var body: some Scene {
        WindowGroup { GameWebView().ignoresSafeArea().statusBarHidden(true) }
    }
}
