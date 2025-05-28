import { StatusCodes } from "http-status-codes";
import { redirect } from "react-router";
import { getNameSpace } from "~/config/namespaces";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { LCDocument } from "~/types/document";
import { ServerError } from "~/types/server";
import { splitCsvText } from "~/utils/splitCsvText";
import type { ActionHandlers } from "../actions/handleActionIntent";
import { requireInternalUser } from "../sessions/requireInternalUser";
import { addSourceFromFiles } from "../sources/addSourcesFromFiles";
import { addDocsToVectorStore } from "../vectorStore/addDocsToVectorStore";

export const newDocActions: ActionHandlers = {
  files: async ({ formData, request }) => {
    const user = await requireInternalUser({ request });

    const submittedFiles = formData
      .getAll(KEYS.files)
      .filter((f) => f instanceof File);

    const files = fileListSchema.parse(submittedFiles);

    const sources = await addSourceFromFiles({ files, userId: user.id });
    const vectorDocs: LCDocument[] = [];

    sources.forEach((s) => {
      vectorDocs.push({
        metadata: {
          sourceId: s.publicId,
          title: s.fileName,
        },
        pageContent: s.text ?? "",
      });
    });

    // this is somewhat expensive, so let's be sure
    if (vectorDocs.length > 0) {
      await addDocsToVectorStore({
        docs: vectorDocs,
        namespace: getNameSpace("user", user.publicId),
      });
    }

    const redirectRoute =
      sources.length === 1
        ? appRoutes("/docs/:id", { id: sources[0].publicId })
        : appRoutes("/docs");

    return redirect(redirectRoute);
  },
  urls: async ({ formData }) => {
    const urlsInput = String(formData.get(KEYS.urls) || "");

    if (!urlsInput || urlsInput.trim() === "") {
      throw new ServerError(
        "At least one URL is required.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const urls = splitCsvText(urlsInput);
    // TODO: process urls
    console.info("urls: ", urls);

    return null;
  },
};
