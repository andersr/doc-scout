import Crypto from "crypto";

export function generateKey(size = 50) {
  return Crypto.randomBytes(size).toString("base64").slice(0, size);
}
