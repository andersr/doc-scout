import { FILE_CONFIG } from "~/config/files";

export const isValidFilename = (filename: string) => {
  if (!filename.includes(".")) {
    return false;
  }

  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension || !FILE_CONFIG.allowedExtensions.includes(extension)) {
    return false;
  }

  const filenameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!filenameRegex.test(filename)) {
    return false;
  }

  return true;
};
