import { hash, verify } from "argon2";

export async function generateHash(str: string) {
  return await hash(str);
}

export async function verifyHash(hash: string, signature: string) {
  return await verify(hash, signature);
}
