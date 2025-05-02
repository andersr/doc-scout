import { QdrantClient } from "@qdrant/js-client-rest";
import { ENV } from "../ENV";

// const client = new QdrantClient({
//   url: "https://1bb2ccd7-c625-480b-ad89-54c3a0dc1636.us-east-1-0.aws.cloud.qdrant.io:6333",
//   apiKey:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.QBGJUcnm9LLbyc1NMfaMLPVFDUNcBr_KpMLkeAUjMd8",
// });

export const qdClient = new QdrantClient({
  url: `https://${ENV.QDRANT_CLUSTER_ID}.us-east-1-0.aws.cloud.qdrant.io:6333`,
  apiKey: ENV.QDRANT_API_KEY,
});

// try {
//   const result = await client.getCollections();
//   console.log("List of collections:", result.collections);
// } catch (err) {
//   console.error("Could not get collections:", err);
// }

// create collection: https://qdrant.tech/documentation/concepts/collections/
// https://qdrant.tech/documentation/data-ingestion-beginners/

// https://github.com/milvus-io/milvus-sdk-node
