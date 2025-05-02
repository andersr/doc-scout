import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// src: node_modules/@langchain/core/dist/documents/document.d.ts
interface Document {
  pageContent: string;
  metadata: Record<string, any>;
  /**
   * An optional identifier for the document.
   *
   * Ideally this should be unique across the document collection and formatted
   * as a UUID, but this will not be enforced.
   */
  id?: string;
}
export async function splitText(docs: Document[]) {
  const allSplits = await splitter.splitDocuments(docs);
  console.log("allSplits: ", allSplits.length);

  return allSplits;
}
