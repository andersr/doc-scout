import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "node_modules/@langchain/core/dist/documents";

export async function splitDocuments(docs: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 200,
    chunkSize: 1000,
  });
  return await splitter.splitDocuments(docs);
}
