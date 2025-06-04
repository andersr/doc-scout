import { useCallback, useState } from "react";
import { useNavigation, useSubmit } from "react-router";
import { KEYS } from "~/shared/keys";
import { Dropzone } from "../Dropzone";
import { ActionButton } from "../ui/ActionButton";

export function FileUploadForm() {
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const submit = useSubmit();

  const filesSubmitDisabled =
    navigation.state !== "idle" || selectedFiles.length === 0;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append(KEYS.intent, KEYS.files);
    for (const file of selectedFiles) {
      formData.append(
        KEYS.files,
        new Blob([file], { type: file.type }), // needs to be explicitly set to prevent generic binary type
        file.name,
      );
    }
    submit(formData, {
      encType: "multipart/form-data",
      method: "post",
    });
  };

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
        {navigation.state === "submitting" ? "Processing..." : "Add Docs"}
      </ActionButton>
    </div>
  );
}
//
