import type { FileUploadOptions } from "~/types/files";

export const FILE_UPLOAD_DEFAULT_CONFIG: FileUploadOptions = {
  allowedExtensions: ["md", "txt", "pdf"], // Updated to remove leading dots for consistency
  allowedFileTypes: ["application/pdf", "text/markdown", "text/plain"],
  maxFiles: 10,
  maxSizeInBytes: 4.5 * 1024 * 1024, // 4.5mb, max allowed file size for Vercel direct file upload
};

// TODO: DRY this up - reuse above config
export const FILETYPES_ACCEPTED = {
  "application/pdf": ["pdf"],
  "text/markdown": ["md"],
  "text/plain": ["txt"],
};

export const INVALID_FILE_ERROR = `Only ${FILE_UPLOAD_DEFAULT_CONFIG.allowedExtensions.join(", ")} files are allowed`;
