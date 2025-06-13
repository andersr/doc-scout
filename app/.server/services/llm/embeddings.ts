import { OpenAIEmbeddings } from "@langchain/openai";
import { EMBEDDING_MODEL } from "~/config/embeddings";
import { ENV } from "../../ENV";

export const oaiEmbeddings = new OpenAIEmbeddings({
  apiKey: ENV.OPENAI_API_KEY,
  model: EMBEDDING_MODEL, // https://js.langchain.com/docs/integrations/vectorstores/pinecone/
});
