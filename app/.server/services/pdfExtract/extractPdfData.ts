import {
  ExtractElementType,
  ExtractPDFJob,
  ExtractPDFParams,
  ExtractPDFResult,
  MimeType,
  SDKError,
  ServiceApiError,
  ServiceUsageError,
} from "@adobe/pdfservices-node-sdk";
import AdmZip from "adm-zip";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { pdfClient } from "~/.server/vendors/adobe/pdfClient";
import { VERCEL_TMP_DIR } from "~/config/files";
import { ServerError } from "~/types/server";

export async function extractPdfData(filePath: string): Promise<string> {
  let readStream;

  try {
    readStream = fs.createReadStream(filePath);

    const inputAsset = await pdfClient.upload({
      mimeType: MimeType.PDF,
      readStream,
    });

    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT],
    });

    const job = new ExtractPDFJob({ inputAsset, params });

    const pollingURL = await pdfClient.submit({ job });
    const pdfServicesResponse = await pdfClient.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult,
    });

    const resultAsset = pdfServicesResponse.result?.resource;

    if (!resultAsset) {
      throw new Error("No result asset returned");
    }
    const streamAsset = await pdfClient.getContent({ asset: resultAsset });
    if (!fs.existsSync(VERCEL_TMP_DIR)) {
      throw new Error("no tmp dir");
    }
    const tempFilePath = path.join(
      VERCEL_TMP_DIR,
      `pdf-extract-${Date.now()}.zip`,
    );

    const writeStream = fs.createWriteStream(tempFilePath);

    await new Promise<void>((resolve, reject) => {
      streamAsset.readStream.pipe(writeStream);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });

    const zip = new AdmZip(tempFilePath);
    const entries = zip.getEntries();

    const structuredDataEntry = entries.find((entry: AdmZip.IZipEntry) =>
      entry.entryName.includes("structuredData.json"),
    );

    if (!structuredDataEntry) {
      throw new ServerError(
        "structuredData.json not found in the extracted ZIP",
        StatusCodes.BAD_GATEWAY,
      );
    }

    const jsonData = JSON.parse(structuredDataEntry.getData().toString("utf8"));

    const extractedText = extractTextFromJsonData(jsonData);

    return extractedText;
  } catch (err) {
    if (
      err instanceof SDKError ||
      err instanceof ServiceUsageError ||
      err instanceof ServiceApiError
    ) {
      console.error("Adobe PDF Services error:", err);
      throw new ServerError(
        `PDF extraction failed: ${err.message}`,
        StatusCodes.BAD_GATEWAY,
      );
    } else {
      console.error("Exception encountered while executing operation", err);
      throw new ServerError(
        `PDF extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        StatusCodes.BAD_GATEWAY,
      );
    }
  } finally {
    readStream?.destroy();
  }
}

interface PdfElement {
  Text?: string;
}

interface PdfJsonData {
  elements?: PdfElement[];
}

function extractTextFromJsonData(jsonData: PdfJsonData): string {
  const textElements: string[] = [];

  if (jsonData.elements && Array.isArray(jsonData.elements)) {
    for (const element of jsonData.elements) {
      if (element.Text) {
        textElements.push(element.Text);
      }
    }
  }

  return textElements.join("\n");
}
