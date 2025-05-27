import { useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { z } from "zod";
import { FILETYPES_ACCEPTED } from "~/config/files";
import { fileSchema } from "~/lib/schemas/files";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";

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
      } else {
        console.error("Dropzone error: ", error);
        return {
          code: "unknown-error",
          message: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        };
      }

      return null;
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
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="cursor-pointer">
            Drag and drop some files here, or click to select files
          </p>
        )}
      </div>

      <ul className="p-4 text-red-400">
        {errorMessages.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
