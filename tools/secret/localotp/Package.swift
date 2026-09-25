// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "LocalOTP",
    platforms: [.macOS(.v13)],
    products: [.executable(name: "localotp", targets: ["localotp"])],
    targets: [
        .target(name: "OTPCore", dependencies: ["SecureInput"]),
        .target(name: "SecureInput"),
        .executableTarget(name: "localotp", dependencies: ["OTPCore", "SecureInput"]),
        .testTarget(name: "OTPCoreTests", dependencies: ["OTPCore"])
    ]
)
