import { describe, expect, it } from "vitest";
import { FILE_UPLOAD_DEFAULT_CONFIG, INVALID_FILE_ERROR } from "~/config/files";
import { validateFile } from "./validateFile";

function createMockFile({
  name,
  size,
  type,
}: {
  name: string;
  size: number;
  type: string;
}): File {
  const file = new File(["content"], name, { type }) as File & { size: number };
  Object.defineProperty(file, "size", { value: size, writable: false });
  return file;
}

describe("validateFile", () => {
  const defaultConfig = FILE_UPLOAD_DEFAULT_CONFIG;

  it("should accept valid markdown files", () => {
    const file = createMockFile({
      name: "test.md",
      size: 1024,
      type: "text/markdown",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeNull();
  });

  it("should accept valid text files", () => {
    const file = createMockFile({
      name: "test.txt",
      size: 1024,
      type: "text/plain",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeNull();
  });

  it("should accept valid PDF files", () => {
    const file = createMockFile({
      name: "document.pdf",
      size: 1024,
      type: "application/pdf",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeNull();
  });

  it("should reject files with invalid extensions", () => {
    const file = createMockFile({
      name: "test.docx",
      size: 1024,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toContain(INVALID_FILE_ERROR);
  });

  it("should reject files with invalid MIME types", () => {
    const file = createMockFile({
      name: "test.pdf",
      size: 1024,
      type: "application/msword", // Wrong MIME type for PDF
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeTruthy();
    expect(result).toContain(INVALID_FILE_ERROR);
  });

  it("should reject files that exceed size limit", () => {
    const file = createMockFile({
      name: "large.pdf",
      size: 5 * 1024 * 1024, // 5MB (over limit)
      type: "application/pdf",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeTruthy();
    expect(result).toContain("File size exceeds");
  });

  it("should handle files with no extension", () => {
    const file = createMockFile({
      name: "README",
      size: 1024,
      type: "text/plain",
    });

    const result = validateFile(file, defaultConfig);

    expect(result).toContain(INVALID_FILE_ERROR);
  });

  it("should handle case-insensitive extensions", () => {
    const file = createMockFile({
      name: "test.PDF",
      size: 1024,
      type: "application/pdf",
    });

    const result = validateFile(file, defaultConfig);
    expect(result).toBeNull();
  });
});
