import { expect, test } from "vitest";
import { slugify } from "./slugify";

test("converts a text string to a slug", () => {
  const INPUT = "  This is my //TEST string with some @#$#@ characters!  ";
  const EXPECTED = "this-is-my-test-string-with-some-dollar-characters";
  expect(slugify(INPUT)).toBe(EXPECTED);
});
