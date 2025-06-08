import axios from "axios";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { SignedUrlPayload } from "~/types/files";
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

  const signedUrlFetcher = useFetcherWithReset<{
    urls?: SignedUrlPayload[];
  }>();

  useEffect(
    function handleSignedUrls() {
      if (
        isUpdating &&
        signedUrlFetcher.state === "idle" &&
        signedUrlFetcher?.data?.urls
      ) {
        uploadFiles({
          urls: signedUrlFetcher?.data?.urls,
        });
        signedUrlFetcher.reset();
      }

      async function uploadFiles({ urls }: { urls: SignedUrlPayload[] }) {
        if (errorMessage) {
          setErrorMessage("");
        }
        if (urls.length === 0) {
          console.warn("no urls returned");
          setErrorMessage(INTENTIONALLY_GENERIC_ERROR_MESSAGE);
          setIsUpdating(false);
          return;
        }

        try {
          for await (const url of urls) {
            const file = selectedFiles.find((f) => f.name === url.fileName);

            if (!file) {
              console.warn(
                `no matching file found for name ${url.fileName}, skipping.`,
              );
              continue;
            }

            await uploadToPresignedUrl(url.signedUrl, file);
          }

          setSelectedFiles([]);

          setIsUpdating(false);

          if (redirectOnDone) {
            const redirectRoute =
              urls.length === 1
                ? appRoutes("/docs/:id", { id: urls[0].sourcePublicId })
                : appRoutes("/docs");
            navigate(redirectRoute);
          }
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
      signedUrlFetcher,
    ],
  );

  async function handleSubmit() {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append(KEYS.intent, KEYS.files);

    for (const file of selectedFiles) {
      formData.append(
        KEYS.files,
        new Blob([file], { type: file.type }), // needs to be explicitly set to prevent generic binary type
        file.name,
      );
    }

    signedUrlFetcher.submit(formData, {
      action: appRoutes("/api/files"),
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

async function uploadToPresignedUrl(presignedUrl: string, file: File) {
  try {
    // TODO: why PUT and not POST?
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    console.error("error: ", error);
  }
}
