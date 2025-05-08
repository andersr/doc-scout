const ID_SECRET_DIVIDER = "|";

export function genApiKey(keyId: string, secretString: string) {
  return `${keyId}${ID_SECRET_DIVIDER}${secretString}`;
}
