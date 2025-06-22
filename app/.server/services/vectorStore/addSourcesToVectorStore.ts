import type { Source } from "@prisma/client";
// import { addDocsToVectorStore } from "@services/vectorStore/addDocsToVectorStore";
import { addDocsToVectorStore } from "./addDocsToVectorStore";

import { getNameSpace } from "~/config/namespaces";
import type { LCDocument } from "~/types/document";

// TODO: should this be in a try/catch or just throw?
export async function addSourcesToVectorStore({
  sources,
  userPublicId,
}: {
  sources: Source[];
  userPublicId: string;
}) {
  try {
    const vectorDocs: LCDocument[] = [];

    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      if (!source.text || source.text?.trim() === "") {
        console.warn(`No text found for ${source.name}, id: ${source.id}`);
        continue;
      }
      vectorDocs.push({
        metadata: {
          sourceId: source.publicId,
          title: source.fileName,
        },
        pageContent: source.text,
      });
    }

    // this is somewhat expensive, so let's be sure
    if (vectorDocs.length > 0) {
      await addDocsToVectorStore({
        docs: vectorDocs,
        namespace: getNameSpace("user", userPublicId),
      });
    }
  } catch (error) {
    console.error("addDocuments error: ", error);
    // TODO: re-throw?
  }
}
