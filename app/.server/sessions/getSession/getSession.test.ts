import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "./getSession";

// Mock the authSessionStore
vi.mock("./authSessionStore", () => ({
  authSessionStore: {
    getSession: vi.fn(),
  },
}));

import { authSessionStore } from "../authSessionStore";

const mockAuthSessionStore = vi.mocked(authSessionStore);

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts cookie from request headers and calls authSessionStore.getSession", async () => {
    // Arrange
    const mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const cookieValue = "session=abc123; path=/";
    const request = new Request("http://localhost", {
      headers: { Cookie: cookieValue },
    });

    // Act
    const result = await getSession({ request });

    // Assert
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith(cookieValue);
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("handles requests without cookie header", async () => {
    // Arrange
    const mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const request = new Request("http://localhost");

    // Act
    const result = await getSession({ request });

    // Assert
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith(null);
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("handles requests with empty cookie header", async () => {
    // Arrange
    const mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const request = new Request("http://localhost", {
      headers: { Cookie: "" },
    });

    // Act
    const result = await getSession({ request });

    // Assert
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith("");
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockSession);
  });

  it("handles multiple cookies in header", async () => {
    // Arrange
    const mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const cookieValue = "session=abc123; other=xyz; path=/";
    const request = new Request("http://localhost", {
      headers: { Cookie: cookieValue },
    });

    // Act
    const result = await getSession({ request });

    // Assert
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith(cookieValue);
    expect(result).toBe(mockSession);
  });

  it("propagates errors from authSessionStore.getSession", async () => {
    // Arrange
    const error = new Error("Session parsing failed");
    mockAuthSessionStore.getSession.mockRejectedValue(error);

    const request = new Request("http://localhost", {
      headers: { Cookie: "invalid=cookie" },
    });

    // Act & Assert
    await expect(getSession({ request })).rejects.toThrow(
      "Session parsing failed",
    );
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith(
      "invalid=cookie",
    );
  });

  it("handles lowercase cookie header name", async () => {
    // Arrange
    const mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const cookieValue = "session=abc123";
    const request = new Request("http://localhost", {
      headers: { cookie: cookieValue }, // lowercase 'cookie'
    });

    // Act
    const result = await getSession({ request });

    // Assert
    // Note: Headers.get() is case-insensitive, so lowercase 'cookie' should work
    expect(mockAuthSessionStore.getSession).toHaveBeenCalledWith(cookieValue);
    expect(result).toBe(mockSession);
  });

  it("returns session object with expected interface", async () => {
    // Arrange
    const mockSession = {
      data: { userId: "123" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue("test-value"),
      has: vi.fn().mockReturnValue(true),
      id: "session-id",
      set: vi.fn(),
      unset: vi.fn(),
    };
    mockAuthSessionStore.getSession.mockResolvedValue(mockSession);

    const request = new Request("http://localhost", {
      headers: { Cookie: "session=abc123" },
    });

    // Act
    const result = await getSession({ request });

    // Assert
    expect(result).toHaveProperty("has");
    expect(result).toHaveProperty("get");
    expect(result).toHaveProperty("set");
    expect(result).toHaveProperty("unset");
    expect(result).toHaveProperty("flash");
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("id");

    // Test that the methods work as expected
    expect(result.has("test")).toBe(true);
    expect(result.get("test")).toBe("test-value");
  });
});
