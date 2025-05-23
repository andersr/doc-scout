import type { Prisma } from "@prisma/client";
import { useState } from "react";
import type { ActionFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { addDocsToVectorStore } from "~/.server/vectorStore/addDocsToVectorStore";
import { FileUploader } from "~/components/file-uploader";
import { Button } from "~/components/ui/button";
import { MAX_FILE_SIZE } from "~/config/files";
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
  return [
    { title: PAGE_TITLE },
    // { content: "Create a new collection", name: "description" },
  ];
}

export default function NewDocsRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [nameValue, setNameValue] = useState("");

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    // if (nameValue === "" && files.length > 0) {
    //   setNameValue(files[0].name);
    // }
  };

  const submitDisabled =
    navigation.state !== "idle" || selectedFiles.length === 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{PAGE_TITLE}</h1>
      <Form
        method="POST"
        encType="multipart/form-data"
        className="flex flex-col gap-6"
      >
        {/* <div className="flex flex-col gap-2">
          <Label htmlFor={PARAMS.COLLECTION_NAME}>Collection Name</Label>
          <Input
            id={PARAMS.COLLECTION_NAME}
            name={PARAMS.COLLECTION_NAME}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Enter collection name"
            required
          />
        </div> */}

        <div className="flex flex-col gap-2">
          {/* <Label>Add Files</Label> */}
          <FileUploader
            inputName={PARAMS.FILE}
            onFilesChange={handleFilesChange}
            label="Upload Files"
            placeholder="Drag and drop files here, or click to select files"
            maxSizeInBytes={MAX_FILE_SIZE}
          />
        </div>

        <Button type="submit" disabled={submitDisabled}>
          {navigation.state === "submitting" ? "Processing..." : "Continue"}
        </Button>
      </Form>

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
    // Get form data
    const formData = await request.formData();
    // const collectionName = formData.get(PARAMS.COLLECTION_NAME)?.toString();
    // TODO: fix assert
    const files = formData.getAll(PARAMS.FILE) as File[];

    // Validate files
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
      namespace: getNameSpace("USER", user.publicId), //`${NAMESPACE_TYPES.USER}_${user.publicId}`,
    });

    if (sources.length === 1) {
      return redirect(appRoutes("/docs/:id", { id: sources[0].publicId }));
    }

    // TODO: display confirmation alert
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
