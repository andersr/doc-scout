import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireParam } from "~/.server/utils/requireParam";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id.sources.new";

export const handle: RouteData = {
  pageTitle: "Upload Markdown File",
};

export function meta() {
  return [
    { title: "Upload Markdown File" },
    { name: "description", content: "Upload a markdown file as a source" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const currentUser = await requireUser(args);
  const projectId = requireParam({ params: args.params, key: "id" });

  const projectMembership = currentUser?.projectMemberships.find(
    (pm) => pm.project?.publicId === projectId,
  );

  // Add alert via AlertProvider OR flash message provider
  if (!projectMembership) {
    console.warn("user is not a member");
    throw redirect(appRoutes("/"));
  }
  if (!projectMembership.project) {
    console.warn("No project found");
    throw redirect(appRoutes("/"));
  }

  return { project: projectMembership.project };
}

export default function UploadMarkdownFile() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const submitDisabled =
    navigation.state === "submitting" || !selectedFile || !!fileError;

  const validateFile = (file: File) => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".md")) {
      return "Only markdown (.md) files are allowed";
    }

    // Check MIME type
    if (file.type !== "text/markdown" && file.type !== "text/plain") {
      return "Invalid file type. Only markdown files are allowed";
    }

    // Check file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      return "File size exceeds 1MB limit";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const error = validateFile(file);
      setFileError(error);
      setSelectedFile(error ? null : file);
    } else {
      setSelectedFile(null);
      setFileError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      setFileError(error);
      setSelectedFile(error ? null : file);

      // Update the file input element to reflect the dropped file
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) {
        // Create a new DataTransfer object and add our file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
      }
    }
  };

  return (
    <div>
      <Form
        method="POST"
        encType="multipart/form-data"
        className="flex flex-col gap-4"
      >
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Label htmlFor="file">Upload Markdown File</Label>
          <Input
            id="file"
            name={PARAMS.FILE}
            type="file"
            accept=".md"
            onChange={handleFileChange}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-2">
            Drag and drop a markdown file here, or click to select a file
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Only .md files up to 1MB are allowed
          </p>
          {fileError && (
            <p className="text-sm text-red-500 mt-2">{fileError}</p>
          )}
          {selectedFile && !fileError && (
            <p className="text-sm text-green-500 mt-2">
              Selected: {selectedFile.name} (
              {Math.round(selectedFile.size / 1024)} KB)
            </p>
          )}
        </div>
        <Button type="submit" disabled={submitDisabled}>
          {navigation.state === "submitting" ? "Uploading..." : "Upload"}
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

export async function action(args: Route.ActionArgs) {
  try {
    const user = await requireUser(args);

    const projectPublicId = requireParam({ params: args.params, key: "id" });
    const projectMembership = user?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectPublicId,
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member",
      );
    }

    const project = projectMembership.project;

    if (!project?.id) {
      throw new Error("No project id found or current user is not a member");
    }

    // Get the uploaded file
    const formData = await args.request.formData();
    const file = formData.get(PARAMS.FILE) as File;

    if (!file) {
      return {
        ok: false,
        errorMessage: "No file uploaded",
      };
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith(".md")) {
      return {
        ok: false,
        errorMessage: "Only markdown (.md) files are allowed",
      };
    }

    // Validate MIME type
    if (file.type !== "text/markdown" && file.type !== "text/plain") {
      return {
        ok: false,
        errorMessage: "Invalid file type. Only markdown files are allowed",
      };
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      return {
        ok: false,
        errorMessage: "File size exceeds 1MB limit",
      };
    }

    // Read file content
    const fileContent = await file.text();

    // Generate a unique ID for the source
    const sourcePublicId = generateId();

    // Create a new Source in the database
    await prisma.source.create({
      data: {
        name: file.name.replace(/\.md$/i, ""), // Use filename without extension
        publicId: sourcePublicId,
        createdAt: new Date(),
        text: fileContent,
        projectId: project.id,
      },
    });

    // Redirect back to the sources list
    return redirect(
      appRoutes("/projects/:id/sources", { id: project.publicId }),
    );
  } catch (error) {
    console.error("File upload error: ", error);
    return {
      ok: false,
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
    };
  }
}
