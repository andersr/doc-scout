import type { FileUploadOptions } from "~/types/files";

export const FILE_UPLOAD_DEFAULT_CONFIG: FileUploadOptions = {
  allowedExtensions: ["md", "txt"], // TODO: prevent these from getting out of sync with allowedFileTypes
  allowedFileTypes: ["text/markdown", "text/plain"],
  maxFiles: 10,
  maxSizeInBytes: 4.5 * 1024 * 1024, // 4.5mb, max allowed file size for Vercel direct file upload
};

// TODO: DRY this up - reuse above config
export const FILETYPES_ACCEPTED = {
  "text/markdown": [".md"],
  "text/plain": [".txt"],
};
