import { OpenAIEmbeddings } from "@langchain/openai";
import { ENV } from "../ENV";

export const oaiEmbeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small", // https://js.langchain.com/docs/integrations/vectorstores/pinecone/
  apiKey: ENV.OPENAI_API_KEY,
});

// const res = await embeddings.embedQuery("Hello world");

// const res = await embeddings.embedDocuments("Hello world");
