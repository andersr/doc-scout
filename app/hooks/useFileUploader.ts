import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FILE_UPLOAD_DEFAULT_CONFIG } from "~/config/files";

import type { AppParam } from "~/shared/params";
import type { FileUploadOptions } from "~/types/files";

interface UseFileUploaderProps {
  inputId: AppParam;
}

export function useFileUploader({
  inputId,
}: UseFileUploaderProps & Partial<FileUploadOptions>) {
  const config: FileUploadOptions = {
    ...FILE_UPLOAD_DEFAULT_CONFIG,
  };
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  const handleFileChange = (files: File[]) => {
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      return;
    }

    if (files.length > config.maxFiles) {
      setFileErrors({ tooMany: `Maximum ${config.maxFiles} files allowed` });
      setSelectedFiles([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // files.forEach((file) => {
    //   const error = validateFile(file, {
    //     allowedExtensions,
    //     allowedFileTypes,
    //     maxSizeInBytes,
    //   });
    //   if (error) {
    //     newFileErrors[file.name] = error;
    //   } else {
    //     newSelectedFiles.push(file);
    //   }
    // });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
  };

  const {
    getInputProps,
    getRootProps,
    isDragAccept,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: config.allowedFileTypes.reduce(
      (acc, type) => {
        acc[type] = config.allowedExtensions;
        return acc;
      },
      {} as Record<string, string[]>,
    ),
    maxFiles: config.maxFiles,
    maxSize: config.maxSizeInBytes,
    multiple: true,
    onDrop: handleFileChange,
  });

  const removeFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(updatedFiles);

    // Update the file input element to reflect the removed file
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput && updatedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }
  };

  return {
    ...config,
    fileErrors,
    getInputProps,
    getRootProps,
    inputId,
    isDragAccept,
    isDragActive,
    isDragReject,
    removeFile,
    selectedFiles,
  };
}
