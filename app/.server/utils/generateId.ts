import { customAlphabet } from "nanoid";
import { ID_ALPHABET, ID_DEFAULT_LENGTH } from "~/config/ids";

const nanoid = customAlphabet(ID_ALPHABET, ID_DEFAULT_LENGTH);

export function generateId(length = ID_DEFAULT_LENGTH) {
  return nanoid(length);
}
