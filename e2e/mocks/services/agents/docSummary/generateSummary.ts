/* eslint-disable @typescript-eslint/no-unused-vars */

export async function generateSummary({ text }: { text: string }) {
  try {
    return "fake summary"; // TODO: move to common config?
  } catch (err) {
    console.error(err);

    return "";
  }
}
