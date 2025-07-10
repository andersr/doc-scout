import fs from "fs";
import { google } from "googleapis";
import path from "path";
import { extractPdfData } from "~/.server/services/pdfExtract/extractPdfData";
import { VERCEL_TMP_DIR } from "~/config/files";

interface FetchGoogleDriveFileParams {
  accessToken: string;
  fileId: string;
  fileName: string;
  mimeType: string;
}

interface FetchGoogleDriveFileResult {
  text: string;
  title: string;
}

export async function fetchGoogleDriveFile({
  accessToken,
  fileId,
  fileName,
  mimeType,
}: FetchGoogleDriveFileParams): Promise<FetchGoogleDriveFileResult> {
  console.info(
    `Fetching Google Drive file: ${fileId}, type: ${mimeType}, name: ${fileName}`,
  );

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ auth: oauth2Client, version: "v3" });

    const fileMetadata = await drive.files.get({
      fields: "name,id,mimeType,size",
      fileId,
    });

    const title = fileMetadata.data.name || fileName;
    let text: string;

    if (mimeType === "application/pdf") {
      const tempFilePath = path.join(
        VERCEL_TMP_DIR,
        `google-drive-pdf-${Date.now()}.pdf`,
      );

      const response = await drive.files.get(
        {
          alt: "media",
          fileId,
        },
        { responseType: "stream" },
      );

      const writeStream = fs.createWriteStream(tempFilePath);

      await new Promise<void>((resolve, reject) => {
        response.data.pipe(writeStream);
        writeStream.on("finish", () => resolve());
        writeStream.on("error", reject);
      });

      try {
        text = await extractPdfData(tempFilePath);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } else if (mimeType.startsWith("text/")) {
      const response = await drive.files.get({
        alt: "media",
        fileId,
      });
      text = response.data as string;
    } else {
      // For Google Docs, Sheets, etc., export as plain text
      const response = await drive.files.export({
        fileId,
        mimeType: "text/plain",
      });
      text = response.data as string;
    }

    return {
      text,
      title,
    };
  } catch (error) {
    console.error("Error fetching Google Drive file:", error);

    // Provide more specific error messages based on the error type
    if (error && typeof error === "object" && "code" in error) {
      const apiError = error as { code: number; message?: string };
      switch (apiError.code) {
        case 404:
          throw new Error(
            `File not found in Google Drive. The file may have been deleted or you may not have permission to access it.`,
          );
        case 403:
          throw new Error(
            `Permission denied. Please make sure you have access to this file and that the app has the necessary permissions.`,
          );
        case 401:
          throw new Error(
            `Authentication failed. Please log in again with Google.`,
          );
        default:
          throw new Error(
            `Google Drive API error (${apiError.code}): ${apiError.message || "Unknown error"}`,
          );
      }
    }

    throw new Error(
      `Failed to fetch file from Google Drive: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
