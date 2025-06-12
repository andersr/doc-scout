import { describe, expect, it, vi } from "vitest";
import { generateS3Key } from "./generateS3Key";

describe("generateS3Key", () => {
  it("generates correct S3 key with file extension", () => {
    const mockTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const result = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(result).toBe(
      "users/user123/sources/source456/document-1640995200000.pdf",
    );

    vi.restoreAllMocks();
  });

  it("generates correct S3 key without file extension", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const result = generateS3Key({
      fileName: "document",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(result).toBe(
      "users/user123/sources/source456/document-1640995200000",
    );

    vi.restoreAllMocks();
  });

  it("handles file names with multiple dots", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const result = generateS3Key({
      fileName: "my.file.backup.txt",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(result).toBe(
      "users/user123/sources/source456/myfilebackup-1640995200000.txt",
    );

    vi.restoreAllMocks();
  });

  it("handles file names starting with dot", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const result = generateS3Key({
      fileName: ".gitignore",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(result).toBe(
      "users/user123/sources/source456/gitignore-1640995200000",
    );

    vi.restoreAllMocks();
  });

  it("handles empty file name gracefully", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const result = generateS3Key({
      fileName: "",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(result).toBe("users/user123/sources/source456/-1640995200000");

    vi.restoreAllMocks();
  });

  it("generates unique keys for same file name with different timestamps", () => {
    const firstTimestamp = 1640995200000;
    const secondTimestamp = 1640995260000; // 1 minute later

    vi.spyOn(Date, "now").mockReturnValue(firstTimestamp);
    const firstResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    vi.spyOn(Date, "now").mockReturnValue(secondTimestamp);
    const secondResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "source456",
      userPublicId: "user123",
    });

    expect(firstResult).toBe(
      "users/user123/sources/source456/document-1640995200000.pdf",
    );
    expect(secondResult).toBe(
      "users/user123/sources/source456/document-1640995260000.pdf",
    );
    expect(firstResult).not.toBe(secondResult);

    vi.restoreAllMocks();
  });

  it("generates different keys for different users", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const userAResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "source456",
      userPublicId: "userA",
    });

    const userBResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "source456",
      userPublicId: "userB",
    });

    expect(userAResult).toBe(
      "users/userA/sources/source456/document-1640995200000.pdf",
    );
    expect(userBResult).toBe(
      "users/userB/sources/source456/document-1640995200000.pdf",
    );
    expect(userAResult).not.toBe(userBResult);

    vi.restoreAllMocks();
  });

  it("generates different keys for different sources", () => {
    const mockTimestamp = 1640995200000;
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    const sourceAResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "sourceA",
      userPublicId: "user123",
    });

    const sourceBResult = generateS3Key({
      fileName: "document.pdf",
      sourcePublicId: "sourceB",
      userPublicId: "user123",
    });

    expect(sourceAResult).toBe(
      "users/user123/sources/sourceA/document-1640995200000.pdf",
    );
    expect(sourceBResult).toBe(
      "users/user123/sources/sourceB/document-1640995200000.pdf",
    );
    expect(sourceAResult).not.toBe(sourceBResult);

    vi.restoreAllMocks();
  });
});
