import { useState } from "react";

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeInBytes?: number;
  allowedFileTypes?: string[];
  allowedExtensions?: string[];
}

interface UseFileUploadResult {
  selectedFiles: File[];
  fileErrors: { [key: string]: string };
  handleFileChange: (files: FileList | null) => void;
  removeFile: (fileName: string) => void;
  resetFiles: () => void;
  validateFile: (file: File) => string | null;
}

export function useFileUpload({
  maxFiles = 10,
  maxSizeInBytes = 1048576, // 1MB default
  allowedFileTypes = ["text/markdown", "text/plain"],
  allowedExtensions = [".md"],
}: UseFileUploadOptions = {}): UseFileUploadResult {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  const validateFile = (file: File): string | null => {
    // Check file extension
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExtension)) {
      return `Only ${allowedExtensions.join(", ")} files are allowed`;
    }

    // Check MIME type
    if (!allowedFileTypes.includes(file.type)) {
      return `Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed`;
    }

    // Check file size
    if (file.size > maxSizeInBytes) {
      return `File size exceeds ${maxSizeInBytes / 1024 / 1024}MB limit`;
    }

    return null;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      return;
    }

    // Check if too many files are selected
    if (files.length > maxFiles) {
      setFileErrors({ tooMany: `Maximum ${maxFiles} files allowed` });
      setSelectedFiles([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // Validate each file
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const resetFiles = () => {
    setSelectedFiles([]);
    setFileErrors({});
  };

  return {
    selectedFiles,
    fileErrors,
    handleFileChange,
    removeFile,
    resetFiles,
    validateFile,
  };
}
