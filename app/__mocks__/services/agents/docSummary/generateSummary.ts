/* eslint-disable @typescript-eslint/no-unused-vars */

// import { MOCK_SOURCE } from "e2e/mocks/sources/mockSource";

export async function generateSummary({ text }: { text: string }) {
  try {
    return "fake summary";
  } catch (err) {
    console.error(err);

    return "";
  }
}
