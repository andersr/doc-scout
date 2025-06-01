import { extractText } from "unpdf";

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const { text } = await extractText(arrayBuffer);
    return Array.isArray(text) ? text.join("\n") : text;
  }

  return await file.text();
}
