import type { FileUploadOptions } from "~/types/files";

export const FILE_CONFIG: FileUploadOptions = {
  allowedExtensions: ["md", "txt", "pdf"],
  allowedFileTypes: ["application/pdf", "text/markdown", "text/plain"],
  maxFiles: 2, //10,
  maxSizeInBytes: 50 * 1024 * 1024, // 50mb
};

export const displaySupportedFormats = FILE_CONFIG.allowedExtensions
  .map((ext) => `.${ext.toUpperCase()}`)
  .join(", ");
// TODO: DRY this up - reuse above config
export const FILETYPES_ACCEPTED = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
};

export const DROPZONE_ERROR_CODES: Record<string, string> = {
  "file-invalid-type": `Invalid file type. Allowed file types: ${displaySupportedFormats}`,
  "too-many-files": "", // handled via FileRejections
};

export const INVALID_FILE_ERROR = `Only ${FILE_CONFIG.allowedExtensions.join(", ")} files are allowed`;

/**
 * Name of temp dir on Vercel serverless host.  We can only create temporary files in this dir on the serverless host.
 */
export const VERCEL_TMP_DIR = "/tmp";
