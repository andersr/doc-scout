import { OpenAIEmbeddings } from "@langchain/openai";
import { EMBEDDING_MODEL } from "~/shared/embeddings";
import { ENV } from "../ENV";

export const oaiEmbeddings = new OpenAIEmbeddings({
  model: EMBEDDING_MODEL, // https://js.langchain.com/docs/integrations/vectorstores/pinecone/
  apiKey: ENV.OPENAI_API_KEY,
});
