import type { Document } from "@langchain/core/documents";
import { TextLoader } from "langchain/document_loaders/fs/text";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
// import {
//     PGVectorStore,
//   } from "@langchain/community/vectorstores/pgvector";
// import { v4 as uuidv4 } from 'uuid';

// Load the document, split it into chunks
// const loader = new TextLoader("./test.txt");
// const raw_docs = await loader.load();
// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 1000,
//   chunkOverlap: 200,
// });
// const docs = await splitter.splitDocuments(docs)

// embed each chunk and insert it into the vector store
// const embeddings_model = new OpenAIEmbeddings();
// const db = await PGVectorStore.fromDocuments(docs, embeddings_model, {
//   postgresConnectionOptions: {
//     connectionString: 'postgresql://langchain:langchain@localhost:6024/langchain'
//   }
// })

export async function loadText(
  path: string
): Promise<Document<Record<string, any>>[]> {
  try {
    const loader = new TextLoader(path);
    const raw_docs = await loader.load();

    return raw_docs;
  } catch (error) {
    console.log("loadText error: ", error);
    return [];
  }
}
