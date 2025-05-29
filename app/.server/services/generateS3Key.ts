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
  const nameWithoutExt =
    fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
  const extension = fileName.substring(fileName.lastIndexOf(".") + 1) || "";

  return `users/${userPublicId}/sources/${sourcePublicId}/${nameWithoutExt}-${timestamp}${extension ? `.${extension}` : ""}`;
}
