import { useEffect, useState } from "react";

import { useNavigate } from "react-router";
import { uploadFileToS3 } from "~/lib/uploadFileToS3";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { SourceInitResponse } from "~/types/files";
import { useFetcherWithReset } from "./useFetcherWithReset";

export function useUploadFiles({
  redirectOnDone,
}: {
  redirectOnDone?: boolean;
} = {}) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [dropError, setDropError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSelect, setShowSelect] = useState(false);

  const sourcesInitFetcher = useFetcherWithReset<{
    items?: SourceInitResponse[];
  }>();

  const sourcesUpdateFetcher = useFetcherWithReset<{
    items?: SourceInitResponse[];
  }>();

  useEffect(
    function handleSignedUrls() {
      if (
        isUpdating &&
        sourcesInitFetcher.state === "idle" &&
        sourcesInitFetcher?.data?.items
      ) {
        if (errorMessage) {
          setErrorMessage("");
        }

        uploadFiles({
          items: sourcesInitFetcher?.data?.items,
        });
        sourcesInitFetcher.reset();
      }

      async function uploadFiles({ items }: { items: SourceInitResponse[] }) {
        try {
          const sourceUpdateData = new FormData();
          sourceUpdateData.append(KEYS.intent, KEYS.files);

          for await (const item of items) {
            const file = selectedFiles.find((f) => f.name === item.fileName);

            if (!file) {
              console.warn(
                `no matching file found for name ${item.fileName}, skipping.`,
              );
              continue;
            }
            sourceUpdateData.append(KEYS.ids, item.sourcePublicId);

            await uploadFileToS3({ file, signedUrl: item.signedUrl });
          }

          sourcesUpdateFetcher.submit(sourceUpdateData, { method: "POST" });
        } catch (error) {
          console.error("handleSignedUrls error: ", error);
          setErrorMessage(INTENTIONALLY_GENERIC_ERROR_MESSAGE);
        }
      }
    },
    [
      errorMessage,
      redirectOnDone,
      navigate,
      isUpdating,
      selectedFiles,
      sourcesInitFetcher,
      sourcesUpdateFetcher,
    ],
  );

  async function handleSubmit() {
    setIsUpdating(true);
    const formData = new FormData();

    for (const file of selectedFiles) {
      formData.append(KEYS.fileNames, file.name);
    }

    sourcesInitFetcher.submit(formData, {
      action: appRoutes("/api/sources"),
      encType: "multipart/form-data",
      method: "post",
    });
  }

  const removeFile = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles([...updated]);
  };

  const handleReset = () => {
    if (dropError) {
      setDropError("");
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return {
    dropError,
    errorMessage,
    handleReset,
    handleSubmit,
    isUpdating: isUpdating,
    removeFile,
    selectedFiles,
    setSelectedFiles,
    setShowSelect,
    showSelect,
  };
}
