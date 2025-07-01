/* eslint-disable @typescript-eslint/no-unused-vars */

export async function generateSummary({ text }: { text: string }) {
  try {
    return "fake summary";
  } catch (err) {
    console.error(err);

    return "";
  }
}
