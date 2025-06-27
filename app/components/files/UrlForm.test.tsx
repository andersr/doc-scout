import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { UrlForm } from "./UrlForm";

// Mock the utility functions
vi.mock("~/utils/isValidUrl", () => ({
  isValidUrl: vi.fn(),
}));

vi.mock("~/utils/splitCsvText", () => ({
  splitCsvText: vi.fn(),
}));

import { isValidUrl } from "~/utils/isValidUrl";
import { splitCsvText } from "~/utils/splitCsvText";

const mockIsValidUrl = vi.mocked(isValidUrl);
const mockSplitCsvText = vi.mocked(splitCsvText);

describe("UrlForm", () => {
  const RouterStub = createRoutesStub([
    {
      action: async () => ({ success: true }),
      Component: UrlForm,
      path: "/",
    },
  ]);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default implementations
    mockIsValidUrl.mockImplementation((url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === "http:" || urlObj.protocol === "https:";
      } catch {
        return false;
      }
    });

    mockSplitCsvText.mockImplementation((str: string) => {
      return str
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    });
  });

  it("renders the form with textarea and submit button", () => {
    render(<RouterStub />);

    expect(screen.getByRole("textbox", { name: "URLs" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter URLs one per line or comma-separated."),
    ).toBeInTheDocument();
  });

  it("submit button is disabled when no URLs are entered", () => {
    render(<RouterStub />);

    const submitButton = screen.getByRole("button", { name: "Continue" });
    expect(submitButton).toBeDisabled();
  });

  it("submit button is enabled when valid URLs are entered", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const submitButton = screen.getByRole("button", { name: "Continue" });

    await user.type(textarea, "https://example.com");

    expect(submitButton).toBeEnabled();
  });

  it("validates single valid URL on blur", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });

    await user.type(textarea, "https://example.com");
    await user.tab(); // trigger blur

    expect(mockSplitCsvText).toHaveBeenCalledWith("https://example.com");
    expect(mockIsValidUrl).toHaveBeenCalledWith("https://example.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("validates multiple valid URLs on blur", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const urlInput = "https://example.com, https://test.com";

    mockSplitCsvText.mockReturnValue([
      "https://example.com",
      "https://test.com",
    ]);

    await user.type(textarea, urlInput);
    await user.tab(); // trigger blur

    expect(mockSplitCsvText).toHaveBeenCalledWith(urlInput);
    expect(mockIsValidUrl).toHaveBeenCalledWith("https://example.com");
    expect(mockIsValidUrl).toHaveBeenCalledWith("https://test.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("displays error for single invalid URL", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const invalidUrl = "not-a-url";

    mockSplitCsvText.mockReturnValue([invalidUrl]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, invalidUrl);
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Invalid URL: not-a-url")).toBeInTheDocument();
    });
  });

  it("displays error for multiple invalid URLs", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const urlInput = "invalid-url1, invalid-url2";

    mockSplitCsvText.mockReturnValue(["invalid-url1", "invalid-url2"]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, urlInput);
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Invalid URLs: invalid-url1, invalid-url2"),
      ).toBeInTheDocument();
    });
  });

  it("displays error for mixed valid and invalid URLs", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const urlInput = "https://example.com, invalid-url";

    mockSplitCsvText.mockReturnValue(["https://example.com", "invalid-url"]);
    mockIsValidUrl.mockImplementation((url) => url === "https://example.com");

    await user.type(textarea, urlInput);
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Invalid URL: invalid-url")).toBeInTheDocument();
    });
  });

  it("clears validation error when user starts typing after an error", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });

    // First, create an error
    mockSplitCsvText.mockReturnValue(["invalid-url"]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, "invalid-url");
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Then start typing again
    await user.type(textarea, "h");

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("submit button is disabled when there are validation errors", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const submitButton = screen.getByRole("button", { name: "Continue" });

    mockSplitCsvText.mockReturnValue(["invalid-url"]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, "invalid-url");
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it("does not validate empty input on blur", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });

    await user.click(textarea);
    await user.tab(); // trigger blur with empty input

    expect(mockSplitCsvText).not.toHaveBeenCalled();
    expect(mockIsValidUrl).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears validation error when input becomes empty", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });

    // First, create an error
    mockSplitCsvText.mockReturnValue(["invalid-url"]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, "invalid-url");
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Clear the input
    await user.clear(textarea);
    await user.tab(); // trigger blur with empty input

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("has correct form attributes and hidden intent field", () => {
    render(<RouterStub />);

    const form = screen.getByRole("textbox", { name: "URLs" }).closest("form");
    expect(form).toHaveAttribute("method", "post");

    const hiddenInput = form?.querySelector('input[name="intent"]');
    expect(hiddenInput).toHaveAttribute("value", "urls");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("has correct accessibility attributes", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });

    // Initially no error
    expect(textarea).toHaveAttribute("aria-invalid", "false");
    expect(textarea).toHaveAttribute("aria-describedby", "description");

    // Create an error
    mockSplitCsvText.mockReturnValue(["invalid-url"]);
    mockIsValidUrl.mockReturnValue(false);

    await user.type(textarea, "invalid-url");
    await user.tab(); // trigger blur

    await waitFor(() => {
      expect(textarea).toHaveAttribute("aria-invalid", "true");
      expect(textarea).toHaveAttribute("aria-describedby", "error");
    });
  });

  it("handles newline-separated URLs", async () => {
    const user = userEvent.setup();
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    const urlInput = "https://example.com\nhttps://test.com";

    mockSplitCsvText.mockReturnValue([
      "https://example.com",
      "https://test.com",
    ]);

    await user.type(textarea, urlInput);
    await user.tab(); // trigger blur

    expect(mockSplitCsvText).toHaveBeenCalledWith(urlInput);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("has correct placeholder text", () => {
    render(<RouterStub />);

    const textarea = screen.getByRole("textbox", { name: "URLs" });
    expect(textarea).toHaveAttribute(
      "placeholder",
      expect.stringContaining("https://example.com/doc1"),
    );
    expect(textarea).toHaveAttribute(
      "placeholder",
      expect.stringContaining("https://example.com/doc2"),
    );
  });
});
