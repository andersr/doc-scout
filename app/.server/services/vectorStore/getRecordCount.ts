import { getIndexStats } from "./getIndexStats";

export async function getRecordCount(namespace: string) {
  const indexStats = await getIndexStats();
  const namespaceStats = indexStats.namespaces
    ? indexStats.namespaces[namespace]
    : undefined;
  return namespaceStats?.recordCount ?? 0;
}
