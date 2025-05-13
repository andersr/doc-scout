import { ENV } from "../ENV";
import { pcClient } from "./client";

export async function getIndexStats() {
  const index = pcClient.index(ENV.PINECONE_INDEX_NAME, ENV.PINECONE_HOST);
  return await index.describeIndexStats();
}
