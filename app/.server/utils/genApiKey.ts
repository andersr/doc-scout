import { ID_SECRET_DIVIDER } from "~/config/auth";

export function genApiKey(keyId: string, secretString: string) {
  return `${keyId}${ID_SECRET_DIVIDER}${secretString}`;
}
