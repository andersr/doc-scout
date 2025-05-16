import type { LCDocument } from "~/types/document";
import { getResetVectorStore } from "../langchain/getResetVectorStore";
import { splitDocuments } from "../langchain/splitDocuments";

export async function addDocsToVectorStore({
  docs,
  collectionName,
}: {
  docs: LCDocument[];
  collectionName: string;
}) {
  try {
    const allSplits = await splitDocuments(docs);

    const vectorStore = await getResetVectorStore(collectionName);

    await vectorStore.addDocuments(allSplits);
  } catch (error) {
    console.error("addDocuments error: ", error);
  }
}
