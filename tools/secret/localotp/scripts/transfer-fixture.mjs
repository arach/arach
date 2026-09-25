// Public synthetic interoperability fixture only. Never load live extension data.
import { webcrypto } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { encryptTransfer } from "./transfer-crypto.mjs";
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const fixture = await encryptTransfer(
  { label: "example public fixture", secret: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ" },
  "public-fixture-password-only"
);
await writeFile(process.argv[2], JSON.stringify(fixture), { mode: 0o600 });
console.log("Encrypted Web Crypto test fixture prepared; values omitted.");
