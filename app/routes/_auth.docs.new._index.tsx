import type { ActionFunctionArgs } from "react-router";
import { redirect, useActionData } from "react-router";
import { serverError } from "~/.server/api/serverError";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { addSourceFromFiles } from "~/.server/sources/addSourcesFromFiles";
import { addDocsToVectorStore } from "~/.server/vectorStore/addDocsToVectorStore";
import { FileUploadForm } from "~/components/forms/FileUploadForm";
import { UrlForm } from "~/components/forms/UrlForm";
import { TabButton, TabContent, Tabs, TabsList } from "~/components/ui/tabs";
import { getNameSpace } from "~/config/namespaces";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { LCDocument } from "~/types/document";
import type { RouteData } from "~/types/routeData";
import { splitCsvText } from "~/utils/splitCsvText";

const PAGE_TITLE = "Add Docs";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

export default function NewDocsRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{PAGE_TITLE}</h1>

      <Tabs defaultValue={KEYS.files}>
        <TabsList>
          <TabButton value={KEYS.files}>Files</TabButton>
          <TabButton value={KEYS.urls}>Via URL</TabButton>
        </TabsList>

        <TabContent value={KEYS.files}>
          <FileUploadForm />
        </TabContent>

        <TabContent value={KEYS.urls}>
          <UrlForm />
        </TabContent>
      </Tabs>

      {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const user = await requireInternalUser(args);
  try {
    const formData = await request.formData();
    const intent = String(formData.get(KEYS.intent) || "");
    const vectorDocs: LCDocument[] = [];

    if (intent === KEYS.files) {
      const submittedFiles = formData
        .getAll(KEYS.files)
        .filter((f) => f instanceof File);

      const files = fileListSchema.parse(submittedFiles);

      const sources = await addSourceFromFiles({ files, userId: user.id });

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
    }

    if (intent === KEYS.urls) {
      const urlsInput = String(formData.get(KEYS.urls) || "");

      if (!urlsInput || urlsInput.trim() === "") {
        return {
          errorMessage: "At least one URL is required.",
          ok: false,
        };
      }

      const urls = splitCsvText(urlsInput);

      // TODO: process urls

      return null;
    }
  } catch (error) {
    return serverError(error);
  }
}
