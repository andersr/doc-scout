/* eslint-disable @typescript-eslint/no-unused-vars */
import { MOCK_SOURCE } from "../../../../e2e/mocks/sources/mockSource";

export async function getMarkdownFromUrl(url: string) {
  return MOCK_SOURCE.text;
}
