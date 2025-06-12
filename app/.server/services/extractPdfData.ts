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
import path from "path";
import { pdfClient } from "../vendors/adobe/pdfClient";

export async function extractPdfData(filePath: string): Promise<string> {
  let readStream;
  // let tmpDir;
  // const appPrefix = "pdf-";
  // let tempFilePath = "";

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
    if (!fs.existsSync("/tmp")) {
      throw new Error("no tmp dir");
    }
    // tmpDir = fs.mkdtempSync(path.join("/tmp", appPrefix));
    const tempFilePath = path.join("/tmp", `pdf-extract-${Date.now()}.zip`);
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
      throw new Error("structuredData.json not found in the extracted ZIP");
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
      throw new Error(`PDF extraction failed: ${err.message}`);
    } else {
      console.error("Exception encountered while executing operation", err);
      throw new Error(
        `PDF extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  } finally {
    readStream?.destroy();
    // if (tmpDir) {
    //   try {
    //     fs.rmSync(tmpDir, { recursive: true });
    //   } catch (cleanupError) {
    //     console.error(
    //       `Failed to remove temporary directory: ${tmpDir}`,
    //       cleanupError,
    //     );
    //   }
    // }
    // if (tempFilePath && fs.existsSync(tempFilePath)) {
    //   fs.unlinkSync(tempFilePath);
    // }
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
