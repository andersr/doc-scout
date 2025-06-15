import { useEffect } from "react";

import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { HandleErrors } from "~/types/error";
import type { SignedUrlResponse } from "~/types/files";
import type { ServerResponse } from "~/types/server";
import { useFetcherWithReset } from "./useFetcherWithReset";

export function useGetSignedUrls({
  handleErrors,
}: {
  handleErrors: HandleErrors;
}) {
  const getSignedUrls = useFetcherWithReset<
    SignedUrlResponse & ServerResponse
  >();

  useEffect(() => {
    if (getSignedUrls.data?.errors && getSignedUrls.data?.errors.length > 0) {
      handleErrors(getSignedUrls.data?.errors);
      getSignedUrls.reset();
    }
  }, [getSignedUrls, handleErrors]);

  async function getSignedUrlsInit(selectedFiles: File[]) {
    const formData = new FormData();

    for (const file of selectedFiles) {
      formData.append(KEYS.fileNames, file.name);
    }

    getSignedUrls.submit(formData, {
      action: appRoutes("/api/signed-urls"),
      encType: "multipart/form-data",
      method: "post",
    });
  }

  return {
    getSignedUrlsInit,
    isUpdating: getSignedUrls.state !== "idle",
    signedUrlsFilesInfo: getSignedUrls?.data?.filesInfo,
  };
}
