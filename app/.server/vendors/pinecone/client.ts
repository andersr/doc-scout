import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "~/.server/ENV";

export const pcClient = new Pinecone({ apiKey: ENV.PINECONE_API_KEY });
