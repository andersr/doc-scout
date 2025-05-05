import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "../ENV";

export const pcClient = new Pinecone({ apiKey: ENV.PINECONE_API_KEY });

// export const pineconeIndex = pcClient.index(ENV.PINECONE_INDEX_NAME);
