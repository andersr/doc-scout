import { customAlphabet } from "nanoid";

// TODO: move to config?
const ID_DEFAULT_LENGTH = 12;
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(ALPHABET, 12);

export function generateId(length = ID_DEFAULT_LENGTH) {
  return nanoid(length);
}
