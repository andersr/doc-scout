import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "node_modules/@langchain/core/dist/documents";

export async function splitDocuments(docs: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return await splitter.splitDocuments(docs);
}
