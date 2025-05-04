import { OpenAIEmbeddings } from "@langchain/openai";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { QdrantVectorStore } from "@langchain/qdrant";
// import { qdClient } from "../qdrant/client";
import type { Document } from "@langchain/core/documents";

// src: https://js.langchain.com/docs/integrations/retrievers/self_query/qdrant/
// src: https://js.langchain.com/docs/integrations/vectorstores/qdrant/
// https://js.langchain.com/docs/tutorials/rag/
// https://js.langchain.com/docs/tutorials/qa_chat_history

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

// export const vectorStore = new MemoryVectorStore(embeddings);

export async function vectorStoreInit({
  docs,
  collectionName,
}: {
  docs: Document[];
  collectionName: string;
}) {
  // const vectorStore = await QdrantVectorStore.fromExistingCollection(
  //   embeddings,
  //   {
  //     client: qdClient,
  //     url: process.env.QDRANT_URL,
  //     collectionName,
  //   }
  // );
  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    // client: qdClient,
    url: process.env.QDRANT_URL,
    collectionName,
  });
  // console.log("vectorStore: ", vectorStore);

  return vectorStore;
}
