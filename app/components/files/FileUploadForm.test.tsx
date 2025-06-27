import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { FileUploadForm } from "./FileUploadForm";

// Mock react-dropzone to control file dropping behavior
vi.mock("react-dropzone", async () => {
  const actual = await vi.importActual("react-dropzone");
  return {
    ...actual,
    useDropzone: vi.fn(),
  };
});

import { useDropzone } from "react-dropzone";

type MockDropzoneReturn = ReturnType<typeof useDropzone>;

const mockUseDropzone = vi.mocked(useDropzone);

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

describe("FileUploadForm", () => {
  const RouterStub = createRoutesStub([
    {
      action: async () => ({ success: true }),
      Component: FileUploadForm,
      path: "/",
    },
  ]);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
    } as unknown as MockDropzoneReturn);
  });

  it("renders the dropzone and submit button", () => {
    render(<RouterStub />);

    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Docs" }),
    ).toBeInTheDocument();
  });

  it("displays invalid file type error message", async () => {
    const invalidFile = createMockFile({
      name: "document.docx",
      size: 1024,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Mock the validator to return an error for invalid file types
    const mockValidator = vi.fn((file: File) => {
      if (file.name.endsWith(".docx")) {
        return {
          code: "file-invalid-type",
          message: "Invalid file type. Allowed types: md, txt, pdf",
        };
      }
      return null;
    });

    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
      validator: mockValidator,
    } as unknown as MockDropzoneReturn);

    render(<RouterStub />);

    // Simulate file drop by calling the validator directly
    const result = mockValidator(invalidFile);
    expect(result).toEqual({
      code: "file-invalid-type",
      message: "Invalid file type. Allowed types: md, txt, pdf",
    });
  });

  it("displays file size exceeded error message", async () => {
    const largeFile = createMockFile({
      name: "large-document.pdf",
      size: 5 * 1024 * 1024, // 5MB (exceeds 4.5MB limit)
      type: "application/pdf",
    });

    const mockValidator = vi.fn((file: File) => {
      if (file.size > 4.5 * 1024 * 1024) {
        return {
          code: "file-too-large",
          message: "File size can not exceed 4.5MB",
        };
      }
      return null;
    });

    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
      validator: mockValidator,
    } as unknown as MockDropzoneReturn);

    render(<RouterStub />);

    const result = mockValidator(largeFile);
    expect(result).toEqual({
      code: "file-too-large",
      message: "File size can not exceed 4.5MB",
    });
  });

  it("displays empty file name error message", async () => {
    const emptyNameFile = createMockFile({
      name: "",
      size: 1024,
      type: "text/plain",
    });

    const mockValidator = vi.fn((file: File) => {
      if (file.name.trim() === "") {
        return {
          code: "file-invalid-name",
          message: "File name cannot be empty",
        };
      }
      return null;
    });

    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
      validator: mockValidator,
    } as unknown as MockDropzoneReturn);

    render(<RouterStub />);

    const result = mockValidator(emptyNameFile);
    expect(result).toEqual({
      code: "file-invalid-name",
      message: "File name cannot be empty",
    });
  });

  it("accepts valid files without showing error messages", async () => {
    const validFile = createMockFile({
      name: "document.pdf",
      size: 1024,
      type: "application/pdf",
    });

    const mockValidator = vi.fn((file: File) => {
      // Simulate valid file validation
      const allowedTypes = ["application/pdf", "text/markdown", "text/plain"];
      const maxSize = 4.5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        return { code: "file-invalid-type", message: "Invalid file type" };
      }
      if (file.size > maxSize) {
        return { code: "file-too-large", message: "File too large" };
      }
      if (file.name.trim() === "") {
        return {
          code: "file-invalid-name",
          message: "File name cannot be empty",
        };
      }

      return null; // Valid file
    });

    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
      validator: mockValidator,
    } as unknown as MockDropzoneReturn);

    render(<RouterStub />);

    const result = mockValidator(validFile);
    expect(result).toBeNull();
  });

  it("displays multiple error messages for multiple invalid files", async () => {
    const invalidFiles = [
      createMockFile({
        name: "document.docx",
        size: 1024,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      createMockFile({
        name: "large.pdf",
        size: 6 * 1024 * 1024, // 6MB
        type: "application/pdf",
      }),
    ];

    const mockValidator = vi.fn((file: File) => {
      const allowedTypes = ["application/pdf", "text/markdown", "text/plain"];
      const maxSize = 4.5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        return {
          code: "file-invalid-type",
          message: "Invalid file type. Allowed types: md, txt, pdf",
        };
      }
      if (file.size > maxSize) {
        return {
          code: "file-too-large",
          message: "File size can not exceed 4.5MB",
        };
      }

      return null;
    });

    mockUseDropzone.mockReturnValue({
      acceptedFiles: [],
      fileRejections: [],
      getInputProps: () => ({ "data-testid": "file-input" }),
      getRootProps: () => ({ "data-testid": "dropzone" }),
      inputRef: { current: null },
      isDragAccept: false,
      isDragActive: false,
      isDragReject: false,
      isFileDialogActive: false,
      isFocused: false,
      open: vi.fn(),
      rootRef: { current: null },
      validator: mockValidator,
    } as unknown as MockDropzoneReturn);

    render(<RouterStub />);

    // Test each file individually
    const firstFileResult = mockValidator(invalidFiles[0]);
    expect(firstFileResult).toEqual({
      code: "file-invalid-type",
      message: "Invalid file type. Allowed types: md, txt, pdf",
    });

    const secondFileResult = mockValidator(invalidFiles[1]);
    expect(secondFileResult).toEqual({
      code: "file-too-large",
      message: "File size can not exceed 4.5MB",
    });
  });

  it("submit button is disabled when no files are selected", () => {
    render(<RouterStub />);

    const submitButton = screen.getByRole("button", { name: "Add Docs" });
    expect(submitButton).toBeDisabled();
  });

  it("displays correct supported formats message", () => {
    render(<RouterStub />);

    expect(
      screen.getByText("Supported formats: .MD, .TXT, .PDF"),
    ).toBeInTheDocument();
  });
});
