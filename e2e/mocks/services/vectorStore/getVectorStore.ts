import type { LCDocument } from "@app/types/document";
import type { VectorMetadataFilter } from "@app/types/vectorDoc";

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function getVectorStore(namespace: string) {
  return {
    addDocuments: (docs: LCDocument[]) => undefined,
    delete: ({
      filter,
      namespace,
    }: {
      deleteAll?: boolean;
      filter?: VectorMetadataFilter;
      namespace: string;
    }) => undefined,
    similaritySearch: (
      question: string,
      k: number,
      filter: VectorMetadataFilter,
    ) => ({ context: [] }),
  };
}
