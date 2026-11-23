// swift-tools-version: 5.9
// The plugin for apps with Flutter's Swift Package Manager support, over the package scruter-cmp-mobile (its product
// ScruterCMP). SCRUTER_CMP_SDK_PATH points at a local checkout of scruter-cmp-mobile for this repository's CI.
import Foundation
import PackageDescription

let local = ProcessInfo.processInfo.environment["SCRUTER_CMP_SDK_PATH"]
let sdkPackage = local.map { URL(fileURLWithPath: $0).lastPathComponent } ?? "scruter-cmp-mobile"

let package = Package(
    name: "scruter_cmp_flutter",
    platforms: [.iOS("15.0")],
    products: [.library(name: "scruter-cmp-flutter", targets: ["scruter_cmp_flutter"])],
    dependencies: [
        local.map { Package.Dependency.package(path: $0) }
            ?? .package(url: "https://github.com/scruter-analytics/scruter-cmp-mobile", from: "1.0.0")
    ],
    targets: [
        .target(name: "scruter_cmp_flutter", dependencies: [.product(name: "ScruterCMP", package: sdkPackage)])
    ]
)
