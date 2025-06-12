import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

export async function fetchToFile(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error(`No res body`);
    }
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createWriteStream(filePath);
    await finished(
      Readable.fromWeb(
        response.body as import("stream/web").ReadableStream<Uint8Array>,
      ).pipe(fileStream),
    );
    console.info(`File downloaded successfully to ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("Error downloading the file:", error);
    throw new Error("error fetching to file");
  }
}

// Example usage
// const fileUrl = "https://www.example.com/file.txt"; // Replace with your file URL
// const saveAsFilename = "downloaded_file.txt"; // Replace with desired filename

// downloadFile(fileUrl, saveAsFilename);
