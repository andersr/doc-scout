import { useState } from "react";
import {
  DEFAULT_ALLOWED_EXTENSIONS,
  DEFAULT_ALLOWED_FILE_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
} from "~/config/files";
import { validateFile } from "~/utils/validateFile";

interface UseFileUploaderProps {
  allowedExtensions?: string[];
  allowedFileTypes?: string[];
  inputName: string;
  maxFiles?: number;
  maxSizeInBytes?: number;
}

export function useFileUploader({
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  inputName,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeInBytes = DEFAULT_MAX_FILE_SIZE,
}: UseFileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      return;
    }

    if (files.length > maxFiles) {
      setFileErrors({ tooMany: `Maximum ${maxFiles} files allowed` });
      setSelectedFiles([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    Array.from(files).forEach((file) => {
      const error = validateFile(file, {
        allowedExtensions,
        allowedFileTypes,
        maxSizeInBytes,
      });
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    handleFileChange(e.dataTransfer.files);

    setIsDraggingOver(false);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(updatedFiles);

    // Update the file input element to reflect the removed file
    const fileInput = document.getElementById(inputName) as HTMLInputElement;
    if (fileInput && updatedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }
  };

  return {
    allowedExtensions,
    fileErrors,
    handleDrop,
    handleOnChange,
    // handleFileChange,
    inputName,
    isDraggingOver,
    maxFiles,
    maxSizeInBytes,
    removeFile,
    selectedFiles,
    setIsDraggingOver,
  };
}
