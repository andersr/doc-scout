import type { FileUploadOptions } from "~/types/files";

export const FILE_CONFIG: FileUploadOptions = {
  allowedExtensions: ["md", "txt", "pdf"],
  allowedFileTypes: ["application/pdf", "text/markdown", "text/plain"],
  maxFiles: 10,
  maxSizeInBytes: 30 * 1024 * 1024, //30mb, for now
};

// TODO: DRY this up - reuse above config
export const FILETYPES_ACCEPTED = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
};

export const INVALID_FILE_ERROR = `Only ${FILE_CONFIG.allowedExtensions.join(", ")} files are allowed`;
