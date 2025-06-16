import fs from "fs";
import { cloudStoreToLocalFile } from "../cloudStore/cloudStoreToLocalFile";
import { extractPdfData } from "./extractPdfData";

export async function extractTextFromCloudStorePdf(
  storagePath: string,
): Promise<string> {
  let text: string = "";
  let localFilePath = "";

  try {
    localFilePath = await cloudStoreToLocalFile(storagePath);
    text = await extractPdfData(localFilePath);
    return text;
  } catch (error) {
    console.error(`Failed to extract PDF data for ${storagePath}:`, error);
    return text;
  } finally {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}
