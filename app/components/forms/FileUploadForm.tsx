import { useCallback } from "react";
import { useUploadFiles } from "~/hooks/useUploadFiles";
import { Dropzone } from "../Dropzone";
import { ActionButton } from "../ui/ActionButton";

export function FileUploadForm() {
  const { handleSubmit, isUpdating, selectedFiles, setSelectedFiles } =
    useUploadFiles({
      redirectOnDone: true,
    });

  const filesSubmitDisabled = isUpdating || selectedFiles.length === 0;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles(acceptedFiles);
    },
    [setSelectedFiles],
  );

  return (
    <div>
      <div className="flex flex-col gap-2">
        <Dropzone onDrop={onDrop} />
        <ul className="p-4 text-green-400">
          {selectedFiles.map((f) => (
            <li key={f.name}>
              {f.name} |{" "}
              <button
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
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ActionButton onClick={handleSubmit} disabled={filesSubmitDisabled}>
        {isUpdating ? "Processing..." : "Add Docs"}
      </ActionButton>
    </div>
  );
}
