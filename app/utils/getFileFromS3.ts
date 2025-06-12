import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { getFromBucket } from "~/.server/aws/getFromBucket";

export async function getFileFromS3(key: string): Promise<string> {
  try {
    const res = await getFromBucket(key);

    if (!res.Body) {
      throw new Error("No body");
    }
    const parts = key.split("/");
    const fileName = parts[parts.length - 1];

    // fs.mkdirSync(path.join(process.cwd(), "tmpfiles"), { recursive: true });
    const filePath = path.join("/tmp", fileName);
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
