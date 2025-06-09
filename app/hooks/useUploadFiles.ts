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

  const sourceUpdateFetcher = useFetcherWithReset<{
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
          const localDbUpdateData = new FormData();
          localDbUpdateData.append(KEYS.intent, KEYS.files);

          for await (const url of urls) {
            const file = selectedFiles.find((f) => f.name === url.fileName);

            if (!file) {
              console.warn(
                `no matching file found for name ${url.fileName}, skipping.`,
              );
              continue;
            }

            const s3UploadData = new FormData();
            s3UploadData.append(
              "file",
              new Blob([file], { type: file.type }),
              file.name,
            );
            localDbUpdateData.append(KEYS.ids, url.sourcePublicId);
            await fetch(url.signedUrl, {
              body: s3UploadData,
              headers: {
                "Content-Type": file.type,
              },
              method: "PUT",
            });
          }

          // setSelectedFiles([]);

          sourceUpdateFetcher.submit(localDbUpdateData, { method: "POST" });

          // const idData = new FormData();
          // // formData.append(KEYS.intent, KEYS.files);

          // for (const file of selectedFiles) {
          //   formData.append(KEYS.ids, file.name);
          // }

          // sourceUpdateFetcher.submit(formData, { method: "post" });

          // fetch file data from s3 bucket and update text, summary, vectorstore
          // if (redirectOnDone) {
          //   const redirectRoute =
          //     urls.length === 1
          //       ? appRoutes("/docs/:id", { id: urls[0].sourcePublicId })
          //       : appRoutes("/docs");
          //   navigate(redirectRoute);
          // }
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
      sourceUpdateFetcher,
    ],
  );

  async function handleSubmit() {
    setIsUpdating(true);
    const formData = new FormData();

    for (const file of selectedFiles) {
      formData.append(KEYS.fileNames, file.name);
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
