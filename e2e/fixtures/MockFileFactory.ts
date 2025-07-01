import { faker } from "@faker-js/faker";
import type { APIRequestContext, Page } from "@playwright/test";
import { dragAndDropFile } from "e2e/helpers/dragAndDropFile";
import { DROPZONE_ID } from "~/config/files";

type FileType = "pdf" | "md" | "xcf";

const MIME_TYPES: Record<FileType, string> = {
  md: "text/markdown",
  pdf: "application/pdf",
  xcf: "",
};
export const PDF_MOCKFILE_NAME = "mockFile.pdf";
export const XCF_MOCKFILE_NAME = "mockFile.xcf";

export const MOCK_FILEPATHS: Record<FileType, string> = {
  md: "./e2e/mocks/files/mockFile.md",
  pdf: `./e2e/mocks/files/${PDF_MOCKFILE_NAME}`,
  xcf: `./e2e/mocks/files/${XCF_MOCKFILE_NAME}`,
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
