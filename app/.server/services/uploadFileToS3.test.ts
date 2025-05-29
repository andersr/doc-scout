import { PutObjectCommand } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadFileToS3 } from "./uploadFileToS3";

// Create a simple mock File object for testing
function createMockFile(
  content: string[],
  fileName: string,
  options?: { type?: string },
) {
  const buffer = Buffer.from(content.join(""));
  return {
    async arrayBuffer(): Promise<ArrayBuffer> {
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    },
    name: fileName,
    type: options?.type || "",
  } as File;
}

// Mock the S3 client and ENV
vi.mock("../aws/s3Client", () => ({
  s3Client: {
    send: vi.fn(),
  },
}));

vi.mock("../ENV", () => ({
  ENV: {
    AWS_DATA_BUCKET_NAME: "test-bucket",
  },
}));

// Import mocked modules
import { s3Client } from "../aws/s3Client";

describe("uploadFileToS3", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("successfully uploads a file to S3", async () => {
    const mockFile = createMockFile(["test content"], "test.txt", {
      type: "text/plain",
    });
    const testKey = "users/user123/sources/source456/test-1640995200000.txt";

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockResolvedValue({} as never);

    const result = await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(result).toBe(testKey);
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Body: expect.any(Buffer),
          Bucket: "test-bucket",
          ContentType: "text/plain",
          Key: testKey,
        },
      }),
    );
  });

  it("uploads file with correct buffer content", async () => {
    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockClear(); // Clear previous calls
    mockSend.mockResolvedValue({} as never);

    const fileContent = "Hello, World!";
    const mockFile = createMockFile([fileContent], "hello.txt", {
      type: "text/plain",
    });
    const testKey = "test-key";

    await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    const calledCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
    const uploadedBuffer = calledCommand.input.Body as Buffer;

    expect(uploadedBuffer).toBeInstanceOf(Buffer);
    expect(uploadedBuffer.toString()).toBe(fileContent);
  });

  it("handles different file types correctly", async () => {
    const mockFile = createMockFile(["binary data"], "image.png", {
      type: "image/png",
    });
    const testKey = "test-image-key";

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockResolvedValue({} as never);

    await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Body: expect.any(Buffer),
          Bucket: "test-bucket",
          ContentType: "image/png",
          Key: testKey,
        },
      }),
    );
  });

  it("handles files without content type", async () => {
    const mockFile = createMockFile(["test content"], "unknown-file");
    const testKey = "test-unknown-key";

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockResolvedValue({} as never);

    await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Body: expect.any(Buffer),
          Bucket: "test-bucket",
          ContentType: "",
          Key: testKey,
        },
      }),
    );
  });

  it("propagates S3 errors", async () => {
    const mockFile = createMockFile(["test content"], "test.txt", {
      type: "text/plain",
    });
    const testKey = "test-key";
    const s3Error = new Error("S3 upload failed");

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockRejectedValue(s3Error);

    await expect(
      uploadFileToS3({
        file: mockFile,
        key: testKey,
      }),
    ).rejects.toThrow("S3 upload failed");
  });

  it("handles empty files", async () => {
    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockClear(); // Clear previous calls
    mockSend.mockResolvedValue({} as never);

    const mockFile = createMockFile([], "empty.txt", {
      type: "text/plain",
    });
    const testKey = "empty-file-key";

    const result = await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(result).toBe(testKey);

    const calledCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
    const uploadedBuffer = calledCommand.input.Body as Buffer;

    expect(uploadedBuffer).toBeInstanceOf(Buffer);
    expect(uploadedBuffer.length).toBe(0);
  });

  it("uses correct bucket name from ENV", async () => {
    const mockFile = createMockFile(["test"], "test.txt", {
      type: "text/plain",
    });
    const testKey = "test-key";

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockResolvedValue({} as never);

    await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: "test-bucket",
        }),
      }),
    );
  });

  it("returns the same key that was provided", async () => {
    const mockFile = createMockFile(["test"], "test.txt", {
      type: "text/plain",
    });
    const testKey = "users/user123/sources/source456/unique-key-12345.txt";

    const mockSend = vi.mocked(s3Client.send);
    mockSend.mockResolvedValue({} as never);

    const result = await uploadFileToS3({
      file: mockFile,
      key: testKey,
    });

    expect(result).toBe(testKey);
  });
});
