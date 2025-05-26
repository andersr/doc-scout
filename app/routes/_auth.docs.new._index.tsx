import type { Prisma } from "@prisma/client";
import type { ActionFunctionArgs } from "react-router";
import { redirect, useActionData } from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { addDocsToVectorStore } from "~/.server/vectorStore/addDocsToVectorStore";
import { FileUploadForm } from "~/components/forms/FileUploadForm";
import { UrlForm } from "~/components/forms/UrlForm";
import { TabButton, TabContent, Tabs, TabsList } from "~/components/ui/tabs";
import { getNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { LCDocument } from "~/types/document";
import type { RouteData } from "~/types/routeData";

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

      <Tabs defaultValue={PARAMS.FILES}>
        <TabsList>
          <TabButton value={PARAMS.FILES}>Files</TabButton>
          <TabButton value={PARAMS.URLS}>Via URL</TabButton>
        </TabsList>

        <TabContent value={PARAMS.FILES}>
          <FileUploadForm />
        </TabContent>

        <TabContent value={PARAMS.URLS}>
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
    const intent = String(formData.get(PARAMS.INTENT) || "");

    if (intent === PARAMS.URLS) {
      const urlsInput = String(formData.get(PARAMS.URLS) || "");

      if (!urlsInput || urlsInput.trim() === "") {
        return {
          errorMessage: "At least one URL is required.",
          ok: false,
        };
      }

      const urls = urlsInput
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      console.info("Submitted URLs:", urls);

      return {
        message: `Received ${urls.length} URLs for processing`,
        ok: true,
      };
    }

    // Handle files intent (existing logic)
    const files = formData.getAll(PARAMS.FILE) as File[];

    if (!files || files.length === 0) {
      return {
        errorMessage: "At least one file is required.",
        ok: false,
      };
    }

    const docs: LCDocument[] = [];
    const sourcesInput: Prisma.SourceCreateManyInput[] = [];

    for (const file of files) {
      try {
        const fileContent = await file.text();
        const fileName = file.name;
        const sourcePublicId = generateId();

        sourcesInput.push({
          createdAt: new Date(),
          fileName: fileName,
          ownerId: user.id,
          publicId: sourcePublicId,
          text: fileContent,
        });

        docs.push({
          metadata: {
            sourceId: sourcePublicId,
            title: fileName,
          },
          pageContent: fileContent,
        });
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }

    const sources = await prisma.source.createManyAndReturn({
      data: sourcesInput,
    });

    await addDocsToVectorStore({
      docs,
      namespace: getNameSpace("USER", user.publicId),
    });

    if (sources.length === 1) {
      return redirect(appRoutes("/docs/:id", { id: sources[0].publicId }));
    }

    return redirect(appRoutes("/docs"));
  } catch (error) {
    console.error("Collection creation error: ", error);
    return {
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    };
  }
}
