import { useState } from "react";

import { useCreateSources } from "./useCreateSources";
import { useGetSignedUrls } from "./useGetSignedUrls";

export function useUploadFiles() {
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    getSignedUrlsInit,
    isUpdating: getSignedUrlsUpdating,
    signedUrlsFilesInfo,
  } = useGetSignedUrls({
    handleErrors: (errors) => {
      setErrors(errors);
      setIsUpdating(false);
    },
  });

  const { isUpdating: createSourcesUpdating } = useCreateSources({
    handleDone: () => {
      setIsUpdating(false);
      setSelectedFiles([]);
    },
    handleErrors: (errors) => {
      setErrors(errors);
      setIsUpdating(false);
    },
    isUpdating,
    selectedFiles,
    signedUrlsFilesInfo,
  });

  async function handleSubmit() {
    setIsUpdating(true);
    setErrors([]);
    getSignedUrlsInit(selectedFiles);
  }

  return {
    errors,
    handleSubmit,
    isUpdating: isUpdating || getSignedUrlsUpdating || createSourcesUpdating,
    selectedFiles,
    setErrors,
    setSelectedFiles,
  };
}
