import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockExtractText } = vi.hoisted(() => {
  return {
    mockExtractText: vi.fn(),
  };
});

vi.mock("unpdf", () => ({
  extractText: mockExtractText,
}));

import { extractTextFromFile } from "./extractTextFromFile";

function createMockFile({
  content = "test content",
  name,
  type,
}: {
  content?: string;
  name: string;
  type: string;
}): File {
  const file = new File([content], name, { type });

  if (type.startsWith("text/")) {
    file.text = vi.fn().mockResolvedValue(content);
  }

  if (type === "application/pdf") {
    file.arrayBuffer = vi
      .fn()
      .mockResolvedValue(new ArrayBuffer(content.length));
  }

  return file;
}

describe("extractTextFromFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractText.mockResolvedValue({
      text: "default extracted text",
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should extract text from markdown files", async () => {
    const file = createMockFile({
      content: "# Hello World\nThis is markdown content.",
      name: "test.md",
      type: "text/markdown",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("# Hello World\nThis is markdown content.");
    expect(file.text).toHaveBeenCalled();
  });

  it("should extract text from plain text files", async () => {
    const file = createMockFile({
      content: "This is plain text content.",
      name: "test.txt",
      type: "text/plain",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("This is plain text content.");
    expect(file.text).toHaveBeenCalled();
  });

  it("should extract text from PDF files", async () => {
    mockExtractText.mockResolvedValue({
      text: "This is extracted PDF content.",
    });

    const file = createMockFile({
      name: "document.pdf",
      type: "application/pdf",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("This is extracted PDF content.");
    expect(mockExtractText).toHaveBeenCalledWith(expect.any(ArrayBuffer));
  });

  it("should handle PDF parsing errors", async () => {
    mockExtractText.mockRejectedValue(new Error("PDF parsing failed"));

    const file = createMockFile({
      name: "corrupt.pdf",
      type: "application/pdf",
    });

    await expect(extractTextFromFile(file)).rejects.toThrow(
      "PDF parsing failed",
    );
  });

  it("should handle empty PDF content", async () => {
    mockExtractText.mockResolvedValue({
      text: "",
    });

    const file = createMockFile({
      name: "empty.pdf",
      type: "application/pdf",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("");
  });

  it("should handle text files with special characters", async () => {
    const file = createMockFile({
      content: "Special chars: éñ中文🙂",
      name: "special.txt",
      type: "text/plain",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("Special chars: éñ中文🙂");
  });

  it("should pass array buffer to unpdf", async () => {
    mockExtractText.mockResolvedValue({
      text: "PDF content",
    });

    const file = createMockFile({
      content: "binary pdf content",
      name: "test.pdf",
      type: "application/pdf",
    });

    await extractTextFromFile(file);

    expect(mockExtractText).toHaveBeenCalledWith(expect.any(ArrayBuffer));
  });

  it("should handle large PDF files", async () => {
    const largeText = "Large PDF content".repeat(1000);
    mockExtractText.mockResolvedValue({
      text: largeText,
    });

    const file = createMockFile({
      name: "large.pdf",
      type: "application/pdf",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe(largeText);
  });

  it("should handle multi-page PDFs", async () => {
    mockExtractText.mockResolvedValue({
      text: "Page 1 content\nPage 2 content",
    });

    const file = createMockFile({
      name: "multipage.pdf",
      type: "application/pdf",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("Page 1 content\nPage 2 content");
    expect(mockExtractText).toHaveBeenCalledWith(expect.any(ArrayBuffer));
  });

  it("should handle text array from unpdf", async () => {
    mockExtractText.mockResolvedValue({
      text: ["Page 1 content", "Page 2 content"],
    });

    const file = createMockFile({
      name: "array-text.pdf",
      type: "application/pdf",
    });

    const result = await extractTextFromFile(file);
    expect(result).toBe("Page 1 content\nPage 2 content");
    expect(mockExtractText).toHaveBeenCalledWith(expect.any(ArrayBuffer));
  });
});
