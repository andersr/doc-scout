import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "../ENV";

export const pcClient = new Pinecone({ apiKey: ENV.PINECONE_API_KEY });

export const pineconeIndex = pcClient.index(ENV.PINECONE_INDEX_NAME);
// export const PINECONE_NAMESPACE = "default";

// export const pcIndexNamespace = pcClient
//   .index(ENV.PINECONE_INDEX_NAME, ENV.PINECONE_HOST)
//   .namespace(PINECONE_NAMESPACE);
