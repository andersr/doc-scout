/* eslint-disable @typescript-eslint/no-unused-vars */

import { MOCK_SOURCE } from "~/__mocks__/sources";

export async function generateSummary({ text }: { text: string }) {
  try {
    return MOCK_SOURCE.summary;
  } catch (err) {
    console.error(err);

    return "";
  }
}
