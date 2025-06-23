import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { useUploadFiles } from "~/hooks/useUploadFiles";
import { IconButton } from "../buttons/icon-button";
import { Dropzone } from "../Dropzone";
import { ActionButton } from "../ui/ActionButton";

export function FileUploadForm() {
  const { errors, handleSubmit, isUpdating, selectedFiles, setSelectedFiles } =
    useUploadFiles();

  const filesSubmitDisabled = isUpdating || selectedFiles.length === 0;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles([...selectedFiles, ...acceptedFiles]);
    },
    [selectedFiles, setSelectedFiles],
  );

  return (
    <div>
      {errors.length > 0 && (
        <ul>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-4">
        <Dropzone onDrop={onDrop} />
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
