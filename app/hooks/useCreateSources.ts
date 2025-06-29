import { useEffect } from "react";

import { uploadFilesToCloudStore } from "~/lib/cloudStorage/uploadFilesToCloudStore";
import { KEYS } from "~/shared/keys";
import type { HandleErrors } from "~/types/error";
import type {
  SignedUrlResponseFileInfo,
  SourceInitResponse,
} from "~/types/files";
import type { ServerResponse } from "~/types/server";
import type { SourceInput } from "~/types/source";
import { useFetcherWithReset } from "./useFetcherWithReset";

export function useCreateSources({
  handleDone,
  handleErrors,
  isUpdating,
  selectedFiles,
  signedUrlsFilesInfo,
}: {
  handleDone: () => void;
  handleErrors: HandleErrors;
  isUpdating: boolean;
  selectedFiles: File[];
  signedUrlsFilesInfo: SignedUrlResponseFileInfo[] | undefined;
}) {
  const createSources = useFetcherWithReset<
    SourceInitResponse & ServerResponse
  >();

  useEffect(() => {
    if (createSources.data?.errors && createSources.data?.errors.length > 0) {
      handleErrors(createSources.data?.errors);
      createSources.reset();
    }
  }, [createSources, handleErrors]);

  useEffect(
    function handleSignedUrlsResponse() {
      if (isUpdating && createSources.state === "idle" && signedUrlsFilesInfo) {
        uploadFilesToCloudStore({
          files: selectedFiles,
          filesInfo: signedUrlsFilesInfo,
          handleDone: function createSourcesInDb() {
            const formData = getSourcesFormData({
              filesInfo: signedUrlsFilesInfo,
            });
            createSources.submit(formData, { method: "POST" });
          },
          handleError: (error) => handleErrors([error]),
        });
      }
    },
    [
      isUpdating,
      selectedFiles,
      createSources,
      signedUrlsFilesInfo,
      handleErrors,
      handleDone,
    ],
  );

  return {
    isUpdating: createSources.state !== "idle",
  };
}

function getSourcesFormData({
  filesInfo,
}: {
  filesInfo: SignedUrlResponseFileInfo[];
}): FormData {
  const formData = new FormData();
  formData.append(KEYS.intent, KEYS.files);

  filesInfo.forEach((f) => {
    formData.append(
      KEYS.sourcesInput,
      JSON.stringify({
        fileName: f.fileName,
        publicId: f.sourcePublicId,
        storagePath: f.storagePath,
      } satisfies SourceInput),
    );
  });

  return formData;
}
