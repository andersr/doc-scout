import type { Prisma } from "@prisma/client";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { addDocsToVectorStore } from "~/.server/vectorStore/addDocsToVectorStore";
import { FileUploader } from "~/components/FileUploader";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MAX_FILE_SIZE } from "~/config/files";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { LCDocument } from "~/types/document";
import type { RouteData } from "~/types/routeData";

const PAGE_TITLE = "New Collection";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [
    { title: PAGE_TITLE },
    { content: "Create a new collection", name: "description" },
  ];
}

export default function NewCollection() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [nameValue, setNameValue] = useState("");

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
    if (nameValue === "" && files.length > 0) {
      setNameValue(files[0].name);
    }
  };

  const submitDisabled =
    navigation.state === "submitting" ||
    nameValue.trim() === "" ||
    selectedFiles.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{PAGE_TITLE}</h1>
      <Form
        method="POST"
        encType="multipart/form-data"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={PARAMS.COLLECTION_NAME}>Collection Name</Label>
          <Input
            id={PARAMS.COLLECTION_NAME}
            name={PARAMS.COLLECTION_NAME}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Enter collection name"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Upload Files</Label>
          <FileUploader
            inputName={PARAMS.FILE}
            onFilesChange={handleFilesChange}
            label="Upload Markdown Files"
            placeholder="Drag and drop markdown files here, or click to select files"
            maxSizeInBytes={MAX_FILE_SIZE}
          />
        </div>

        <Button type="submit" disabled={submitDisabled}>
          {navigation.state === "submitting"
            ? "Creating..."
            : "Create Collection"}
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

export async function action(args: LoaderFunctionArgs) {
  const { request } = args;
  try {
    await requireUser(args);

    // Get form data
    const formData = await request.formData();
    const collectionName = formData.get(PARAMS.COLLECTION_NAME) as string;
    const files = formData.getAll(PARAMS.FILE) as File[];

    // Validate collection name
    if (!collectionName || collectionName.trim() === "") {
      return {
        errorMessage: "Collection name is required",
        ok: false,
      };
    }

    // Validate files
    if (!files || files.length === 0) {
      return {
        errorMessage: "At least one file is required",
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
          name: fileName,
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

    const collection = await prisma.collection.create({
      data: {
        chat: {
          create: {
            createdAt: new Date(),
            publicId: generateId(),
          },
        },
        createdAt: new Date(),
        name: collectionName,
        publicId: generateId(),
        sources: {
          createMany: {
            data: sourcesInput,
          },
        },
      },
    });

    await addDocsToVectorStore({
      docs,
      namespace: collection.publicId,
    });

    return redirect(appRoutes("/collections/:id", { id: collection.publicId }));
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
