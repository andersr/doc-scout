import { PineconeStore } from "@langchain/pinecone";

import { ENV } from "../../ENV";
import { pcClient } from "../../vendors/pinecone/client";
import { oaiEmbeddings } from "./embeddings";

export async function getVectorStore(namespace: string) {
  return await PineconeStore.fromExistingIndex(oaiEmbeddings, {
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    namespace,
    pineconeIndex: pcClient.Index(ENV.PINECONE_INDEX_NAME),
  });
}
