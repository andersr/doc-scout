import { describe, expect, it } from "vitest";
import { fileListSchema, fileSchema } from "./files";

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

describe("fileSchema", () => {
  it("should validate markdown files", () => {
    const file = createMockFile({
      name: "test.md",
      size: 1024,
      type: "text/markdown",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should validate text files", () => {
    const file = createMockFile({
      name: "test.txt",
      size: 1024,
      type: "text/plain",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should validate PDF files", () => {
    const file = createMockFile({
      name: "document.pdf",
      size: 1024,
      type: "application/pdf",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should reject files with empty names", () => {
    const file = createMockFile({
      name: "",
      size: 1024,
      type: "text/plain",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "File name cannot be empty",
      );
    }
  });

  it("should reject files with only whitespace names", () => {
    const file = createMockFile({
      name: "   ",
      size: 1024,
      type: "text/plain",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "File name cannot be empty",
      );
    }
  });

  it("should reject unsupported file types", () => {
    const file = createMockFile({
      name: "test.docx",
      size: 1024,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid file type");
    }
  });

  it("should reject files exceeding size limit", () => {
    const file = createMockFile({
      name: "large.pdf",
      size: 5 * 1024 * 1024, // 5MB
      type: "application/pdf",
    });

    const result = fileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "File size can not exceed",
      );
    }
  });
});

describe("fileListSchema", () => {
  it("should validate array of valid files", () => {
    const files = [
      createMockFile({ name: "test.md", size: 1024, type: "text/markdown" }),
      createMockFile({ name: "doc.pdf", size: 2048, type: "application/pdf" }),
      createMockFile({ name: "notes.txt", size: 512, type: "text/plain" }),
    ];

    const result = fileListSchema.safeParse(files);
    expect(result.success).toBe(true);
  });

  it("should reject empty array", () => {
    const result = fileListSchema.safeParse([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("No files selected");
    }
  });

  it("should reject arrays exceeding max files limit", () => {
    const files = Array.from({ length: 11 }, (_, i) =>
      createMockFile({
        name: `file${i}.txt`,
        size: 1024,
        type: "text/plain",
      }),
    );

    const result = fileListSchema.safeParse(files);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Maximum 10 files allowed",
      );
    }
  });

  it("should reject array with invalid files", () => {
    const files = [
      createMockFile({ name: "test.md", size: 1024, type: "text/markdown" }),
      createMockFile({
        name: "invalid.docx",
        size: 1024,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ];

    const result = fileListSchema.safeParse(files);
    expect(result.success).toBe(false);
  });

  it("should handle mixed valid file types", () => {
    const files = [
      createMockFile({ name: "readme.md", size: 1024, type: "text/markdown" }),
      createMockFile({
        name: "report.pdf",
        size: 3 * 1024 * 1024,
        type: "application/pdf",
      }),
      createMockFile({ name: "data.txt", size: 512, type: "text/plain" }),
    ];

    const result = fileListSchema.safeParse(files);
    expect(result.success).toBe(true);
  });
});
