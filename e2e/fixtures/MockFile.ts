// import { faker } from "@faker-js/faker";
import { faker } from "@faker-js/faker";
import type { Page } from "@playwright/test";
import { dragAndDropFile } from "e2e/helpers/dragAndDropFile";
import { DROPZONE_ID } from "~/config/files";

type FileType = "pdf" | "md";

const MIME_TYPES: Record<FileType, string> = {
  md: "text/markdown",
  pdf: "application/pdf",
};

const MOCK_FILEPATHS: Record<FileType, string> = {
  md: "./e2e/mocks/files/mockFile.md",
  pdf: "./e2e/mocks/files/mockFile.pdf",
};

export class MockFile {
  public fileName: string;
  public fileType: FileType;

  constructor(
    type: FileType,
    public readonly page: Page,
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
  // public fileName: string;
  // public fileType: FileType;

  constructor(public readonly page: Page) {}

  // generateFilename() {
  //   return `${faker.system.fileName({
  //     extensionCount: 0,
  //   })}.${this.fileType}`;
  // }

  newMockFile(type: FileType) {
    return new MockFile(type, this.page);
  }
}
