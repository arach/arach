import CryptoKit
import Foundation

public enum OTPError: Error, Sendable {
    case invalidSecret, invalidParameters, invalidName, invalidRecord
}

public enum Algorithm: String, Codable, CaseIterable, Sendable {
    case sha1 = "SHA1", sha256 = "SHA256", sha512 = "SHA512"
}

public struct Parameters: Codable, Equatable, Sendable {
    public let algorithm: Algorithm
    public let digits: Int
    public let period: UInt64

    public init(algorithm: Algorithm = .sha1, digits: Int = 6, period: UInt64 = 30) throws {
        guard (6...8).contains(digits), (1...3600).contains(period) else {
            throw OTPError.invalidParameters
        }
        self.algorithm = algorithm
        self.digits = digits
        self.period = period
    }

    public func validate() throws {
        _ = try Parameters(algorithm: algorithm, digits: digits, period: period)
    }
}

public enum Base32 {
    /// Strict RFC 4648 decoding with optional canonical padding. Spaces and
    /// hyphens are accepted for manually transcribed enrollment keys.
    public static func decode(_ input: String) throws -> Data {
        guard input.utf8.count <= 4096, input.utf8.allSatisfy({ $0 < 128 }) else { throw OTPError.invalidSecret }
        let text = input.uppercased().filter { $0 != " " && $0 != "-" }
        let symbols = Array(text.utf8)
        let firstPadding = symbols.firstIndex(of: 61) ?? symbols.count
        let count = firstPadding
        guard count > 0, [0, 2, 4, 5, 7].contains(count % 8) else { throw OTPError.invalidSecret }
        if firstPadding < symbols.count {
            guard symbols.count % 8 == 0,
                  symbols[firstPadding...].allSatisfy({ $0 == 61 }),
                  symbols.count - firstPadding == (8 - count % 8) % 8 else {
                throw OTPError.invalidSecret
            }
        }
        var result = Data()
        var accumulator: UInt32 = 0
        var bits = 0
        for byte in symbols.prefix(count) {
            let value: UInt32
            switch byte {
            case 65...90: value = UInt32(byte - 65)
            case 50...55: value = UInt32(byte - 50 + 26)
            default: throw OTPError.invalidSecret
            }
            accumulator = (accumulator << 5) | value
            bits += 5
            if bits >= 8 {
                bits -= 8
                result.append(UInt8((accumulator >> bits) & 255))
            }
            accumulator &= (1 << bits) - 1
        }
        guard accumulator == 0 else { throw OTPError.invalidSecret }
        return result
    }
}

public enum OTP {
    public static func code(secret: Data, time: UInt64, parameters: Parameters) throws -> String {
        try parameters.validate()
        return try hotp(secret: secret, counter: time / parameters.period,
                        algorithm: parameters.algorithm, digits: parameters.digits)
    }

    public static func hotp(secret: Data, counter: UInt64, algorithm: Algorithm, digits: Int) throws -> String {
        guard !secret.isEmpty, (6...8).contains(digits) else { throw OTPError.invalidParameters }
        var bigEndian = counter.bigEndian
        let message = withUnsafeBytes(of: &bigEndian) { Data($0) }
        let key = SymmetricKey(data: secret)
        let digest: [UInt8]
        switch algorithm {
        case .sha1: digest = Array(HMAC<Insecure.SHA1>.authenticationCode(for: message, using: key))
        case .sha256: digest = Array(HMAC<SHA256>.authenticationCode(for: message, using: key))
        case .sha512: digest = Array(HMAC<SHA512>.authenticationCode(for: message, using: key))
        }
        let offset = Int(digest[digest.count - 1] & 15)
        let binary = (UInt32(digest[offset] & 127) << 24)
            | (UInt32(digest[offset + 1]) << 16)
            | (UInt32(digest[offset + 2]) << 8)
            | UInt32(digest[offset + 3])
        let modulus: UInt32 = digits == 6 ? 1_000_000 : digits == 7 ? 10_000_000 : 100_000_000
        let value = String(binary % modulus)
        return String(repeating: "0", count: digits - value.count) + value
    }
}

public struct AccountRecord: Codable, Sendable {
    public let version: Int
    public let parameters: Parameters
    public let secret: Data

    public init(secret: Data, parameters: Parameters) throws {
        self.version = 1
        self.parameters = parameters
        self.secret = secret
        try validate()
    }

    public func validate() throws {
        guard version == 1, (16...1024).contains(secret.count) else { throw OTPError.invalidRecord }
        try parameters.validate()
    }

    public static func validateName(_ name: String) throws {
        guard !name.isEmpty, name.utf8.count <= 128,
              name == name.trimmingCharacters(in: .whitespacesAndNewlines),
              name.unicodeScalars.allSatisfy({ !CharacterSet.controlCharacters.contains($0)
                  && !CharacterSet.newlines.contains($0)
                  && !CharacterSet.illegalCharacters.contains($0)
                  && $0.properties.generalCategory != .format }),
              !name.lowercased().contains("otpauth:") else { throw OTPError.invalidName }
    }
}
