import { uploadFileToS3 } from "~/lib/uploadFileToS3";
import type { SignedUrlResponseFileInfo } from "~/types/files";

export async function uploadFilesToCloudStore({
  files,
  filesInfo,
  handleDone,
  handleError,
}: {
  files: File[];
  filesInfo: SignedUrlResponseFileInfo[];
  handleDone: () => void;
  handleError: (error: string) => void;
}) {
  try {
    for await (const fileInfo of filesInfo) {
      const file = files.find((f) => f.name === fileInfo.fileName);

      if (!file) {
        console.warn(
          `no matching file found for name ${fileInfo.fileName}, skipping.`,
        );
        continue;
      }

      await uploadFileToS3({ file, signedUrl: fileInfo.signedUrl });
    }

    handleDone();
  } catch (error) {
    console.error("uploadFiles error: ", error);
    handleError(`Error uploading files: ${error}`);
  }
}
