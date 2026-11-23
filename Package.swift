// swift-tools-version:5.9
// Scruter CMP for iOS: the consent banner of Scruter CMP as a native sheet, and the proof of every choice.
// Independent of Scruter Analytics (github.com/scruter-analytics/scruter-mobile): an app takes one, the other or both.
// https://scruter.net/cmp · MIT licence.
import PackageDescription

let package = Package(
    name: "ScruterCMP",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [
        .library(name: "ScruterCMP", targets: ["ScruterCMP"]),
    ],
    targets: [
        .target(
            name: "ScruterCMP",
            path: "ios/Sources/ScruterCMP",
            resources: [.copy("PrivacyInfo.xcprivacy")]
        ),
        .testTarget(
            name: "ScruterCMPTests",
            dependencies: ["ScruterCMP"],
            path: "ios/Tests/ScruterCMPTests"
        ),
    ]
)
