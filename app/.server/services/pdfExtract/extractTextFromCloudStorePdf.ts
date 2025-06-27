import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { ServerError } from "~/types/server";
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
    throw new ServerError(
      `Failed to extract PDF data for ${storagePath}: ${error}`,
      StatusCodes.BAD_GATEWAY,
    );
  } finally {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}
