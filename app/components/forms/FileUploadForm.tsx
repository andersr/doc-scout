import { useCallback } from "react";
import type { FileRejection } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { DROPZONE_ERROR_CODES } from "~/config/files";
import { useUploadFiles } from "~/hooks/useUploadFiles";
import { truncateString } from "~/utils/truncateString";
import { IconButton } from "../buttons/icon-button";
import { Dropzone } from "../Dropzone";
import { ActionButton } from "../ui/ActionButton";

export function FileUploadForm() {
  const {
    errors,
    handleSubmit,
    isUpdating,
    selectedFiles,
    setErrors,
    setSelectedFiles,
  } = useUploadFiles();

  const filesSubmitDisabled = isUpdating || selectedFiles.length === 0;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // console.log("acceptedFiles: ", acceptedFiles);
      // console.log("fileRejections: ", fileRejections);

      if (fileRejections.length > 0) {
        const errors = fileRejections.map((fr) => {
          const err = fr.errors[0];
          const errCodeMessage = DROPZONE_ERROR_CODES[err.code] ?? "";

          return `${truncateString(fr.file.name, 20)}: ${errCodeMessage ? `${errCodeMessage}. ` : ""}`;
        });
        setErrors(errors);
      }
      setSelectedFiles([...selectedFiles, ...acceptedFiles]);
    },
    [selectedFiles, setErrors, setSelectedFiles],
  );

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Dropzone onDrop={onDrop} />
        {errors.length > 0 && (
          <div
            className="border-danger bg-danger/5 mt-4 rounded-md border p-4"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {/* <h4 className="mb-2 text-sm font-semibold">
                  Add Doc Error{errors.length > 1 ? "s" : ""}:
                </h4> */}
                <ul className="space-y-1">
                  {errors.map((message, index) => (
                    <li key={`${message}-${index}`} className="list-inside">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        <ul
          className={twMerge(
            "flex flex-col gap-2",
            selectedFiles.length > 0 ? "pb-4" : "",
          )}
        >
          {selectedFiles.map((f) => (
            <li key={f.name} className="flex gap-1">
              <span className="font-semibold">{f.name}</span>
              <IconButton
                name="REMOVE"
                title="Remove item"
                onClick={() => {
                  const updated = [...selectedFiles];
                  const index = selectedFiles.findIndex(
                    (selectedFile) => f.name == selectedFile.name,
                  );
                  if (index !== -1) {
                    updated.splice(index, 1);
                    setSelectedFiles(updated);
                  }
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      <ActionButton onClick={handleSubmit} disabled={filesSubmitDisabled}>
        {isUpdating ? "Processing..." : "Add Docs"}
      </ActionButton>
      {isUpdating && (
        <div className="py-4 text-sm italic">This may take a while...</div>
      )}
    </div>
  );
}
