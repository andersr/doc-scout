import type { Session } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockServerEnv } from "../../../__mocks__/env";

// Mock ENV module to prevent validation errors
mockServerEnv();

// Mock getSession
vi.mock("../getSession", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "../getSession";
import { getCookieValue } from "./getCookieValue";

const mockGetSession = vi.mocked(getSession);

// Define proper mock types
interface MockSession extends Session {
  data: Record<string, unknown>;
  flash: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  id: string;
  set: ReturnType<typeof vi.fn>;
  unset: ReturnType<typeof vi.fn>;
}

describe("getCookieValue", () => {
  let mockSession: MockSession;
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "test-session-id",
      set: vi.fn(),
      unset: vi.fn(),
    };

    mockRequest = new Request("http://localhost", {
      headers: { Cookie: "session=abc123" },
    });

    mockGetSession.mockResolvedValue(mockSession);
  });

  it("returns existing cookie value", async () => {
    // Arrange
    const key = "userId";
    const expectedValue = "user-123";
    mockSession.get.mockReturnValue(expectedValue);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBe(expectedValue);
  });

  it("returns undefined for non-existent cookie value", async () => {
    // Arrange
    const key = "nonExistentKey";
    mockSession.get.mockReturnValue(undefined);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBeUndefined();
  });

  it("handles string cookie values correctly", async () => {
    // Arrange
    const key = "sessionToken";
    const stringValue = "token-abc-123";
    mockSession.get.mockReturnValue(stringValue);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBe(stringValue);
    expect(typeof result).toBe("string");
  });

  it("handles empty string cookie values", async () => {
    // Arrange
    const key = "emptyValue";
    const emptyValue = "";
    mockSession.get.mockReturnValue(emptyValue);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBe(emptyValue);
    expect(result).toBe("");
  });

  it("handles special character keys", async () => {
    // Arrange
    const key = "user.settings.theme";
    const value = "dark-mode";
    mockSession.get.mockReturnValue(value);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBe(value);
  });

  it("propagates errors from getSession", async () => {
    // Arrange
    const key = "errorKey";
    const error = new Error("Session retrieval failed");
    mockGetSession.mockRejectedValue(error);

    // Act & Assert
    await expect(getCookieValue({ key, request: mockRequest })).rejects.toThrow(
      "Session retrieval failed",
    );

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.get).not.toHaveBeenCalled();
  });

  it("handles session.get throwing an error", async () => {
    // Arrange
    const key = "errorProneKey";
    const error = new Error("Session get failed");
    mockSession.get.mockImplementation(() => {
      throw error;
    });

    // Act & Assert
    await expect(getCookieValue({ key, request: mockRequest })).rejects.toThrow(
      "Session get failed",
    );

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.get).toHaveBeenCalledWith(key);
  });

  it("calls getSession with correct request object", async () => {
    // Arrange
    const key = "testKey";
    const customRequest = new Request("http://example.com", {
      headers: { Cookie: "custom=value" },
    });

    // Act
    await getCookieValue({ key, request: customRequest });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: customRequest });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it("returns the exact value from session.get", async () => {
    // Arrange
    const key = "exactValue";
    const complexValue = "complex-token-with-special-chars-!@#$%^&*()";
    mockSession.get.mockReturnValue(complexValue);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(result).toBe(complexValue);
    expect(result).toStrictEqual(complexValue);
  });

  it("handles null return from session.get", async () => {
    // Arrange
    const key = "nullKey";
    mockSession.get.mockReturnValue(null);

    // Act
    const result = await getCookieValue({ key, request: mockRequest });

    // Assert
    expect(mockSession.get).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });
});
