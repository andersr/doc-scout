import { slugify } from "~/utils/slugify";

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

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    console.warn("file without an extension:", fileName);
  }

  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex + 1);

  return `users/${userPublicId}/sources/${sourcePublicId}/${slugify(nameWithoutExt)}-${timestamp}${extension ? `.${extension}` : ""}`;
}
