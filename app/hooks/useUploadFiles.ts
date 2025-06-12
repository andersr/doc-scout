import { useEffect, useState } from "react";

import { useNavigate } from "react-router";
import { uploadFileToS3 } from "~/lib/uploadFileToS3";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { SourceInitResponse } from "~/types/files";
import type { ServerResponse } from "~/types/server";
import { useFetcherWithReset } from "./useFetcherWithReset";

export function useUploadFiles({
  redirectOnDone,
}: {
  redirectOnDone?: boolean;
} = {}) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);
  const [dropError, setDropError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSelect, setShowSelect] = useState(false);

  const sourcesInitFetcher = useFetcherWithReset<
    {
      items?: SourceInitResponse[];
    } & ServerResponse
  >();

  const sourcesUpdateFetcher = useFetcherWithReset<
    {
      items?: SourceInitResponse[];
    } & ServerResponse
  >();

  useEffect(() => {
    if (
      sourcesInitFetcher.data?.errors &&
      sourcesInitFetcher.data?.errors.length > 0
    ) {
      setErrors(sourcesInitFetcher.data?.errors);
      setIsUpdating(false);
      sourcesInitFetcher.reset();
    }
  }, [sourcesInitFetcher]);

  useEffect(() => {
    if (
      sourcesUpdateFetcher.data?.errors &&
      sourcesUpdateFetcher.data?.errors.length > 0
    ) {
      setErrors(sourcesUpdateFetcher.data?.errors);
      setIsUpdating(false);
      sourcesUpdateFetcher.reset();
    }
  }, [sourcesUpdateFetcher]);

  useEffect(
    function handleSignedUrls() {
      if (
        isUpdating &&
        sourcesInitFetcher.state === "idle" &&
        sourcesInitFetcher?.data?.items
      ) {
        if (errors.length > 0) {
          setErrors([]);
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
          setErrors([INTENTIONALLY_GENERIC_ERROR_MESSAGE]);
        }
      }
    },
    [
      errors,
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
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return {
    dropError,
    errors,
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
