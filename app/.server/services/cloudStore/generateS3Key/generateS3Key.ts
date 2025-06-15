import { slugify } from "~/utils/slugify";

// TODO:require file extension
export function generateS3Key({
  fileName,
  sourcePublicId,
  userPublicId,
}: {
  fileName: string;
  sourcePublicId: string;
  userPublicId: string;
}): string {
  const timestamp = Date.now();
  const lastDotIndex = fileName.lastIndexOf(".");

  let nameWithoutExt: string; // get rid of this
  let extension: string;

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No extension or file starts with dot (like .gitignore)
    nameWithoutExt = fileName;
    extension = "";
  } else {
    nameWithoutExt = fileName.substring(0, lastDotIndex);
    extension = fileName.substring(lastDotIndex + 1);
  }

  return `users/${userPublicId}/sources/${sourcePublicId}/${slugify(nameWithoutExt)}-${timestamp}${extension ? `.${extension}` : ""}`;
}
