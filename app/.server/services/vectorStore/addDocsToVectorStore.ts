import type { LCDocument } from "~/types/document";
import { getVectorStore } from "./getVectorStore";
import { splitDocuments } from "./splitDocuments";

export async function addDocsToVectorStore({
  docs,
  namespace,
}: {
  docs: LCDocument[];
  namespace: string;
}) {
  try {
    const allSplits = await splitDocuments(docs);

    const vectorStore = await getVectorStore(namespace);

    await vectorStore.addDocuments(allSplits);
  } catch (error) {
    console.error("addDocuments error: ", error);
  }
}
