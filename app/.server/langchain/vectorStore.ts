import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

// src: https://js.langchain.com/docs/integrations/vectorstores/qdrant/

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export async function vectorStoreInit({
  collectionName,
}: {
  collectionName: string;
}) {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName,
    }
  );
}
