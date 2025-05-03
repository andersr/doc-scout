import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// src: https://js.langchain.com/docs/integrations/vectorstores/qdrant/
// https://js.langchain.com/docs/tutorials/rag/
// https://js.langchain.com/docs/tutorials/qa_chat_history

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export const vectorStore = new MemoryVectorStore(embeddings);

// export async function vectorStoreInit({
//   collectionName,
// }: {
//   collectionName: string;
// }) {
//   const vectorStore = await QdrantVectorStore.fromExistingCollection(
//     embeddings,
//     {
//       url: process.env.QDRANT_URL,
//       collectionName,
//     }
//   );
// }
