import { useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { z } from "zod";
import { FILETYPES_ACCEPTED } from "~/config/files";
import { LG_ICON_SIZE } from "~/config/icons";
import { fileSchema } from "~/lib/schemas/files";
import { cn } from "~/lib/utils";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { Icon } from "./icon";

// TODO:fix dropzone validation, need to map zod error issues to dropzone codes - currently not working
export function Dropzone({
  onDrop,
}: {
  onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
}) {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  function validator(file: File) {
    try {
      fileSchema.parse(file);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError && error.issues.length > 0) {
        setErrorMessages(error.issues.map((e) => e.message));
        return null;
        // return {
        //   code: "size-too-large",
        //   message: "Image file is larger than 3MB",
        // };
      } else {
        console.error("Dropzone error: ", error);
        return {
          code: "unknown-error",
          message: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        };
      }
    }
  }
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: FILETYPES_ACCEPTED,
    multiple: true,
    onDragEnter: () => setErrorMessages([]),
    onDrop,
    onDropAccepted: () => setErrorMessages([]),
    validator,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out",
          "bg-background/50 p-8 text-center",
          "hover:bg-accent/50 hover:border-accent-foreground/50",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          isDragActive
            ? "border-primary bg-primary/5 text-primary bg-white"
            : "border-muted-foreground/25 text-muted-foreground",
        )}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
      >
        <input {...getInputProps()} aria-describedby="dropzone-description" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon
              name="UPLOAD_FILE"
              fontSize={LG_ICON_SIZE}
              label="Upload files"
            />
          </div>

          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-primary text-lg font-medium">
                Drop files here
              </p>
            ) : (
              <>
                <p className="text-lg font-medium">Drag and drop files here</p>
                <p className="text-muted-foreground text-sm">
                  or click to browse files
                </p>
              </>
            )}
          </div>

          <div
            className="text-muted-foreground text-xs"
            id="dropzone-description"
          >
            Supported formats: PDF, DOC, DOCX, TXT, MD
          </div>
        </div>
      </div>

      {errorMessages.length > 0 && (
        <div
          className="border-destructive/20 bg-destructive/5 mt-4 rounded-md border p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <div className="text-destructive mt-0.5">
              <Icon name="DONE" customStyles="rotate-45" label="Error" />
            </div>
            <div className="flex-1">
              <h4 className="text-destructive mb-2 text-sm font-medium">
                Upload Error{errorMessages.length > 1 ? "s" : ""}
              </h4>
              <ul className="text-destructive/80 space-y-1 text-sm">
                {errorMessages.map((message, index) => (
                  <li
                    key={`${message}-${index}`}
                    className="list-inside list-disc"
                  >
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
