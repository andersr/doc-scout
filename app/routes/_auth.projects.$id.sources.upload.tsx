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
  pageTitle: "Upload Markdown Files",
};

export function meta() {
  return [
    { title: "Upload Markdown Files" },
    { name: "description", content: "Upload markdown files as sources" },
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

export default function UploadMarkdownFiles() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  const MAX_FILES = 10;

  const submitDisabled =
    navigation.state === "submitting" ||
    selectedFiles.length === 0 ||
    Object.keys(fileErrors).length > 0;

  const validateFile = (file: File): string | null => {
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
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      return;
    }

    // Check if too many files are selected
    if (files.length > MAX_FILES) {
      setFileErrors({ tooMany: `Maximum ${MAX_FILES} files allowed` });
      setSelectedFiles([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // Validate each file
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      return;
    }

    // Check if too many files are selected
    if (files.length > MAX_FILES) {
      setFileErrors({ tooMany: `Maximum ${MAX_FILES} files allowed` });
      setSelectedFiles([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // Validate each file
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);

    // Update the file input element to reflect the dropped files
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput && newSelectedFiles.length > 0) {
      // Create a new DataTransfer object and add our files
      const dataTransfer = new DataTransfer();
      newSelectedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));

    // Update the file input element to reflect the removed file
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput && selectedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      selectedFiles
        .filter((file) => file.name !== fileName)
        .forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
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
          <Label htmlFor="file">Upload Markdown Files</Label>
          <Input
            id="file"
            name={PARAMS.FILE}
            type="file"
            accept=".md"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-2">
            Drag and drop markdown files here, or click to select files
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Only .md files up to 1MB are allowed (maximum {MAX_FILES} files)
          </p>

          {/* Display errors */}
          {Object.keys(fileErrors).length > 0 && (
            <div className="mt-2">
              {Object.entries(fileErrors).map(([fileName, error]) => (
                <p key={fileName} className="text-sm text-red-500">
                  {fileName === "tooMany" ? error : `${fileName}: ${error}`}
                </p>
              ))}
            </div>
          )}

          {/* Display selected files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 text-left">
              <h3 className="font-medium mb-2">Selected Files:</h3>
              <ul className="space-y-1">
                {selectedFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button type="submit" disabled={submitDisabled}>
          {navigation.state === "submitting"
            ? "Uploading..."
            : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? "File" : "Files"}`}
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

    // Get the uploaded files
    const formData = await args.request.formData();
    const files = formData.getAll(PARAMS.FILE) as File[];

    const MAX_FILES = 10;

    if (!files || files.length === 0) {
      return {
        ok: false,
        errorMessage: "No files uploaded",
      };
    }

    // Check if too many files are uploaded
    if (files.length > MAX_FILES) {
      return {
        ok: false,
        errorMessage: `Maximum ${MAX_FILES} files allowed`,
      };
    }

    // Process each file
    const createdSources = [];
    const errors = [];

    for (const file of files) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith(".md")) {
        errors.push(`${file.name}: Only markdown (.md) files are allowed`);
        continue;
      }

      // Validate MIME type
      if (file.type !== "text/markdown" && file.type !== "text/plain") {
        errors.push(
          `${file.name}: Invalid file type. Only markdown files are allowed`,
        );
        continue;
      }

      // Validate file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        errors.push(`${file.name}: File size exceeds 1MB limit`);
        continue;
      }

      try {
        // Read file content
        const fileContent = await file.text();

        // Generate a unique ID for the source
        const sourcePublicId = generateId();

        // Create a new Source in the database
        const source = await prisma.source.create({
          data: {
            name: file.name.replace(/\.md$/i, ""), // Use filename without extension
            publicId: sourcePublicId,
            createdAt: new Date(),
            text: fileContent,
            projectId: project.id,
          },
        });

        createdSources.push(source);
      } catch (err) {
        errors.push(`${file.name}: Failed to process file`);
        console.error(`Error processing file ${file.name}:`, err);
      }
    }

    // If there were errors but some files were processed successfully
    if (errors.length > 0 && createdSources.length > 0) {
      return {
        ok: true,
        errorMessage: `Uploaded ${createdSources.length} file(s) with ${errors.length} error(s): ${errors.join("; ")}`,
      };
    }

    // If all files failed
    if (errors.length > 0 && createdSources.length === 0) {
      return {
        ok: false,
        errorMessage: `Failed to upload files: ${errors.join("; ")}`,
      };
    }

    // If all files were processed successfully
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
