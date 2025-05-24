import type { Prisma } from "@prisma/client";
import type { ActionFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { addDocsToVectorStore } from "~/.server/vectorStore/addDocsToVectorStore";
import { FileUploader } from "~/components/file-uploader";
import { Button } from "~/components/ui/button";
import { TabButton, TabContent, Tabs, TabsList } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { getNameSpace } from "~/config/namespaces";
import { useFileUploader } from "~/hooks/useFileUploader";
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
  const navigation = useNavigation();

  const fileUploader = useFileUploader({
    inputName: PARAMS.FILE,
  });

  const { selectedFiles } = fileUploader;

  const filesSubmitDisabled =
    navigation.state !== "idle" || selectedFiles.length === 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{PAGE_TITLE}</h1>

      <Tabs defaultValue={PARAMS.FILES}>
        <TabsList>
          <TabButton value={PARAMS.FILES}>Files</TabButton>
          <TabButton value={PARAMS.URLS}>Via URL</TabButton>
        </TabsList>

        <TabContent value={PARAMS.FILES}>
          <Form
            method="POST"
            encType="multipart/form-data"
            className="flex flex-col gap-6"
          >
            <input type="hidden" name={PARAMS.INTENT} value={PARAMS.FILES} />

            <div className="flex flex-col gap-2">
              <FileUploader
                {...fileUploader}
                label="Upload Files"
                placeholder="Drag and drop files here, or click to select files"
              />
            </div>

            <Button type="submit" disabled={filesSubmitDisabled}>
              {navigation.state === "submitting" ? "Processing..." : "Continue"}
            </Button>
          </Form>
        </TabContent>

        <TabContent value={PARAMS.URLS}>
          <Form method="POST" className="flex flex-col gap-6">
            <input type="hidden" name={PARAMS.INTENT} value={PARAMS.URLS} />

            <div className="flex flex-col gap-2">
              <label htmlFor="urls" className="text-sm font-medium">
                URLs
              </label>
              <Textarea
                id="urls"
                name={PARAMS.URLS}
                placeholder="Enter URLs, one per line or comma-separated&#10;https://example.com/doc1&#10;https://example.com/doc2"
                rows={6}
                required
              />
              <p className="text-muted-foreground text-sm">
                Enter URLs one per line or comma-separated
              </p>
            </div>

            <Button type="submit" disabled={navigation.state !== "idle"}>
              {navigation.state === "submitting" ? "Processing..." : "Continue"}
            </Button>
          </Form>
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
