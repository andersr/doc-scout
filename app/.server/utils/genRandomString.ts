import Crypto from "crypto";

export function genRandomString(size = 32) {
  const buffer = Crypto.randomBytes(size);
  return buffer.toString("hex");
}
