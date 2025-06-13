import { getRecordCount } from "./getRecordCount";
import { getVectorStore } from "./vectorStore";

export async function getResetVectorStore(namespace: string) {
  const recordCount = await getRecordCount(namespace);
  if (recordCount !== 0) {
    const vectorStoreTmp = await getVectorStore(namespace);
    await vectorStoreTmp.delete({
      deleteAll: true,
      namespace,
    });
  }
  return await getVectorStore(namespace);
}
