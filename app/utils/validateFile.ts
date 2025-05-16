import type { FileUploadOptions } from "~/types/files";

export const validateFile = (
  file: File,
  { allowedExtensions, allowedFileTypes, maxSizeInBytes }: FileUploadOptions,
): string | null => {
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
