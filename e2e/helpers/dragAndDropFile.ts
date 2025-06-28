import type { Page } from "@playwright/test";
import { readFileSync } from "fs";

interface DragAndDropFileInput {
  fileName: string;
  filePath: string;
  mimeType: string;
  selector: string;
}

// src: https://stackoverflow.com/a/77738836/2008639
export const dragAndDropFile = async (
  page: Page,
  { fileName, filePath, mimeType, selector }: DragAndDropFileInput,
) => {
  const buffer = readFileSync(filePath).toString("base64");

  const dataTransfer = await page.evaluateHandle(
    async ({ bufferData, localFileName, localFileType }) => {
      const dt = new DataTransfer();

      const blobData = await fetch(bufferData).then((res) => res.blob());

      const file = new File([blobData], localFileName, { type: localFileType });
      dt.items.add(file);
      return dt;
    },
    {
      bufferData: `data:${mimeType};base64,${buffer}`,
      localFileName: fileName,
      localFileType: mimeType,
    },
  );

  await page.dispatchEvent(selector, "drop", { dataTransfer });
};
