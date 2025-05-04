import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

// import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { ENV } from "../ENV";
import { pcClient } from "../pinecone/client";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  openAIApiKey: ENV.OPENAI_API_KEY,
});

// const pinecone = new PineconeClient();
// Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
// const pineconeIndexTMP = pcClient.Index(ENV.PINECONE_INDEX_NAME);

// export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
//   pineconeIndex: pineconeIndexTMP,
//   // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
//   maxConcurrency: 5,
//   // You can pass a namespace here too
//   // namespace: "foo",
// });

export async function getVectorStore(namespace: string) {
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pcClient.Index(ENV.PINECONE_INDEX_NAME),
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    // You can pass a namespace here too
    namespace,
  });
}
