import { extractText } from "unpdf";

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === "application/pdf") {
    // Dynamic import of unpdf for Node.js

    const arrayBuffer = await file.arrayBuffer();
    const { text } = await extractText(arrayBuffer);
    return Array.isArray(text) ? text.join("\n") : text;
  }

  // For text files (markdown, plain text), use the existing method
  return await file.text();
}
