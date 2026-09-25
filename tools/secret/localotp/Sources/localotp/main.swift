import Darwin
import Foundation
import OTPCore
import SecureInput

private enum CLIError: Error {
    case usage, terminal, inputTooLong, output, coreDump, configuration
}

private let help = """
LocalOTP — local macOS TOTP authenticator

  localotp enroll NAME [--algorithm SHA1|SHA256|SHA512] [--digits 6|7|8] [--period SECONDS]
  localotp list
  localotp code NAME [--stdout]
  localotp remove NAME
  localotp import-extension ENCRYPTED_FILE NAME
  localotp receive-transfer NAME
  localotp help

Enrollment reads a Base32 seed only through a hidden /dev/tty prompt.
Raw account data is stored in an encrypted vault; only its unlock key is in Keychain.
Defaults: SHA1, 6 digits, 30 seconds. Period range: 1–3600 seconds.
Code output requires a terminal unless --stdout explicitly permits a pipe.
Remove requires a local confirmation. No seed arguments or seed exports.
import-extension accepts only the encrypted transfer format and prompts for its password.
receive-transfer accepts a bounded record from a private non-terminal pipe directly into the vault.
Set LOCALOTP_VAULT_DIR to an absolute directory to override vault storage.
Account names appear in commands and listings: use an alias, never a seed or password.
"""

private func hidden(_ prompt: String) throws -> String {
    let capacity = 4098
    let buffer = UnsafeMutablePointer<CChar>.allocate(capacity: capacity)
    buffer.initialize(repeating: 0, count: capacity)
    defer {
        localotp_wipe(buffer, capacity)
        buffer.deallocate()
    }
    let status = localotp_read_hidden(prompt, buffer, capacity)
    guard status != -2 else { throw CLIError.inputTooLong }
    guard status == 0 else { throw CLIError.terminal }
    return String(cString: buffer)
}

private func storeFromEnvironment() throws -> VaultStore {
    let directory: URL
    if let configured = ProcessInfo.processInfo.environment["LOCALOTP_VAULT_DIR"] {
        guard configured.hasPrefix("/"), !configured.utf8.contains(0) else {
            throw CLIError.configuration
        }
        directory = URL(fileURLWithPath: configured, isDirectory: true)
    } else {
        directory = VaultStore.defaultDirectory
    }
    return try VaultStore(directory: directory, keys: KeychainVaultKeys())
}

private func run() throws {
    guard localotp_disable_core_dumps() == 0 else { throw CLIError.coreDump }
    let args = Array(CommandLine.arguments.dropFirst())
    guard let command = args.first else { print(help); return }
    if ["help", "--help", "-h"].contains(command), args.count == 1 { print(help); return }
    switch command {
    case "list":
        guard args.count == 1 else { throw CLIError.usage }
        for name in try storeFromEnvironment().names() { print(name) }
    case "enroll":
        guard args.count >= 2, (args.count - 2) % 2 == 0 else { throw CLIError.usage }
        let name = args[1]
        try AccountRecord.validateName(name)
        var algorithm = Algorithm.sha1
        var digits = 6
        var period: UInt64 = 30
        var seen = Set<String>()
        for index in stride(from: 2, to: args.count, by: 2) {
            guard seen.insert(args[index]).inserted else { throw CLIError.usage }
            let value = args[index + 1]
            switch args[index] {
            case "--algorithm":
                guard let parsed = Algorithm(rawValue: value.uppercased()) else { throw CLIError.usage }
                algorithm = parsed
            case "--digits":
                guard let parsed = Int(value) else { throw CLIError.usage }
                digits = parsed
            case "--period":
                guard let parsed = UInt64(value) else { throw CLIError.usage }
                period = parsed
            default: throw CLIError.usage
            }
        }
        let parameters = try Parameters(algorithm: algorithm, digits: digits, period: period)
        let store = try storeFromEnvironment()
        guard !(try store.names()).contains(name) else { throw StoreError.duplicate }
        let secret = try Base32.decode(hidden("Base32 seed (hidden; never paste into chat): "))
        let record = try AccountRecord(secret: secret, parameters: parameters)
        try store.add(name: name, record: record)
        print("Account enrolled locally. No external account was changed.")
    case "code":
        guard args.count == 2 || (args.count == 3 && args[2] == "--stdout") else { throw CLIError.usage }
        try AccountRecord.validateName(args[1])
        guard isatty(STDOUT_FILENO) == 1 || args.count == 3 else { throw CLIError.output }
        let record = try storeFromEnvironment().read(name: args[1])
        // Read the time after any Keychain unlock/authorization prompt.
        let now = Date().timeIntervalSince1970
        guard now.isFinite, now >= 0, now < Double(UInt64.max) else { throw OTPError.invalidParameters }
        print(try OTP.code(secret: record.secret, time: UInt64(now), parameters: record.parameters))
    case "import-extension":
        guard args.count == 3 else { throw CLIError.usage }
        try AccountRecord.validateName(args[2])
        let data = try ExtensionTransfer.readFile(path: args[1])
        let store = try storeFromEnvironment()
        guard !(try store.names()).contains(args[2]) else { throw StoreError.duplicate }
        let record = try ExtensionTransfer.decrypt(data, password: hidden("Transfer password (hidden): "))
        try store.add(name: args[2], record: record)
        print("Account imported into the encrypted local vault. Source entry was not changed.")
    case "receive-transfer":
        guard args.count == 2 else { throw CLIError.usage }
        try AccountRecord.validateName(args[1])
        guard isatty(STDIN_FILENO) == 0 else { throw CLIError.usage }
        var data = Data()
        while let chunk = try FileHandle.standardInput.read(upToCount: 16385 - data.count), !chunk.isEmpty {
            data.append(chunk)
            guard data.count <= 16384 else { throw TransferError.invalidFile }
        }
        let record = try ExtensionTransfer.decodePrivatePipe(data)
        let store = try storeFromEnvironment()
        try store.add(name: args[1], record: record)
        // Verify persistence without returning a seed or generating a live code.
        let restored = try store.read(name: args[1])
        guard restored.secret == record.secret, restored.parameters == record.parameters else { throw VaultError.invalid }
        print("Account received, encrypted, and verified in the local vault. Source entry was not changed.")
    case "remove":
        guard args.count == 2 else { throw CLIError.usage }
        try AccountRecord.validateName(args[1])
        let store = try storeFromEnvironment()
        guard (try store.names()).contains(args[1]) else { throw StoreError.missing }
        guard try hidden("Delete this local entry? Type delete to confirm (hidden): ") == "delete" else {
            print("Cancelled."); return
        }
        try store.remove(name: args[1])
        print("Local entry removed. External account settings were not changed.")
    default: throw CLIError.usage
    }
}

do { try run() }
catch {
    let message: String
    switch error {
    case CLIError.configuration: message = "Invalid vault directory configuration. Supply an absolute directory path."
    case CLIError.usage: message = "Invalid command or options. Run localotp help."
    case CLIError.terminal: message = "Hidden input requires a foreground local terminal; input was not read from stdin."
    case CLIError.inputTooLong: message = "Input is too long. Nothing was enrolled."
    case CLIError.output: message = "Code output requires a terminal. Use --stdout to explicitly allow code output for an authorized recipient."
    case CLIError.coreDump: message = "Could not disable core dumps; refusing to access secrets."
    case OTPError.invalidName: message = "Use a nonempty display name of at most 128 UTF-8 bytes without surrounding whitespace or control characters."
    case OTPError.invalidSecret: message = "Invalid Base32 seed. Check the local source; do not paste it into chat."
    case OTPError.invalidRecord: message = "Seed must decode to 16–1024 bytes, or stored record is unsupported."
    case OTPError.invalidParameters: message = "Invalid TOTP parameters or system time."
    case StoreError.duplicate: message = "Account name already exists. Existing entries are never overwritten."
    case StoreError.missing: message = "Account not found in the local vault."
    case VaultError.invalid: message = "Vault authentication or format validation failed. The vault was not overwritten."
    case VaultError.missingKey: message = "Vault unlock key is missing from the default Keychain. Restore the matching key; a replacement will not be generated."
    case VaultError.unsafePath: message = "Vault path is unsafe. Require a private owned directory and regular owned files without symlinks or hard links."
    case VaultError.busy: message = "Vault is in use by another process. Retry after it finishes."
    case VaultError.full: message = "Vault capacity reached (1000 accounts or 16 MiB)."
    case VaultError.io: message = "Vault file operation failed. Check local permissions and free space, then inspect the account listing before retrying."
    case TransferError.invalidFile: message = "Invalid transfer input. No input values are included in diagnostics."
    case TransferError.authentication: message = "Transfer could not be authenticated or validated. Check its password and file locally; no entry was imported."
    case StoreError.keychain(let status): message = "Keychain operation failed (OSStatus \(status)). Unlock the default Keychain or review its access permissions locally."
    default: message = "Operation failed. No sensitive diagnostic data is emitted."
    }
    FileHandle.standardError.write(Data(("localotp: " + message + "\n").utf8))
    exit(1)
}
