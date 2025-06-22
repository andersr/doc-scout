/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LCDocument } from "~/types/document";

export async function addDocsToVectorStore({
  docs,
  namespace,
}: {
  docs: LCDocument[];
  namespace: string;
}) {
  // try {
  //   const allSplits = await splitDocuments(docs);
  //   const vectorStore = await getResetVectorStore(namespace);
  //   await vectorStore.addDocuments(allSplits);
  // } catch (error) {
  //   console.error("addDocuments error: ", error);
  // }
}
