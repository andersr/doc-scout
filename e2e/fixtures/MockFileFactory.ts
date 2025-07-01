import { faker } from "@faker-js/faker";
import type { APIRequestContext, Page } from "@playwright/test";
import { dragAndDropFile } from "e2e/helpers/dragAndDropFile";
import { MOCK_SOURCE } from "e2e/mocks/sources/mockSource";
import { DROPZONE_ID } from "~/config/files";

type FileType = "pdf" | "md";

const MIME_TYPES: Record<FileType, string> = {
  md: "text/markdown",
  pdf: "application/pdf",
};
export const PDF_MOCKFILE_NAME = "mockFile.pdf";
export const MOCK_FILEPATHS: Record<FileType, string> = {
  md: "./e2e/mocks/files/mockFile.md",
  pdf: `./e2e/mocks/files/${PDF_MOCKFILE_NAME}`,
};

export class MockFile {
  public fileName: string;
  public fileType: FileType;

  constructor(
    type: FileType,
    public readonly page: Page,
    public readonly request: APIRequestContext,
  ) {
    this.fileType = type;
    this.fileName = this.generateFilename();
  }

  generateFilename() {
    return `${faker.system.fileName({
      extensionCount: 0,
    })}.${this.fileType}`;
  }

  getFilename() {
    return this.fileName;
  }

  async dragAndDrop() {
    await dragAndDropFile(this.page, {
      fileName: this.fileName,
      filePath: MOCK_FILEPATHS[this.fileType],
      mimeType: MIME_TYPES[this.fileType],
      selector: `#${DROPZONE_ID}`,
    });
  }

  async mockStorageRoute() {
    await this.page.route(
      `https://*.s3.*.amazonaws.com/users/**/*`,
      async (route) => {
        const json = {
          filesInfo: [this.getFileInfo()],
        };
        await route.fulfill({ json });
      },
    );
  }

  private getFileInfo() {
    return {
      fileName: this.getFilename(),
      signedUrl: "https://foo",
      sourcePublicId: MOCK_SOURCE.publicId,
      storagePath: MOCK_SOURCE.storagePath,
    };
  }
}

export class MockFileFactory {
  constructor(
    public readonly page: Page,
    public readonly request: APIRequestContext,
  ) {}

  newMockFile(type: FileType) {
    return new MockFile(type, this.page, this.request);
  }
}
