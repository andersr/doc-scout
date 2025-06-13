import type { LCDocument } from "~/types/document";
import { splitDocuments } from "../../langchain/splitDocuments";
import { getResetVectorStore } from "./getResetVectorStore";

export async function addDocsToVectorStore({
  docs,
  namespace,
}: {
  docs: LCDocument[];
  namespace: string;
}) {
  try {
    const allSplits = await splitDocuments(docs);

    const vectorStore = await getResetVectorStore(namespace);

    await vectorStore.addDocuments(allSplits);
  } catch (error) {
    console.error("addDocuments error: ", error);
  }
}
