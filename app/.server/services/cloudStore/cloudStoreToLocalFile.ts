import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getFromBucket } from "~/.server/services/cloudStore/getFromBucket";
import { VERCEL_TMP_DIR } from "~/config/files";
import { getFilenameFromPath } from "~/utils/getFilenameFromPath";

export async function cloudStoreToLocalFile(key: string): Promise<string> {
  try {
    const res = await getFromBucket(key);

    if (!res.Body) {
      throw new Error("No body");
    }

    const fileName = getFilenameFromPath(key);
    const filePath = path.join(VERCEL_TMP_DIR, fileName);
    const writeStream = fs.createWriteStream(filePath);
    const readStream = res.Body as Readable;

    return new Promise((resolve, reject) => {
      readStream.pipe(writeStream);
      writeStream.on("finish", () => resolve(filePath));
      writeStream.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading the file:", error);
    throw new Error("error fetching to file");
  }
}
