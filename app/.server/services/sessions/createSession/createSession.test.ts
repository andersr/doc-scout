import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock ENV module to prevent validation errors
mockServerEnv();

// Mock react-router redirect
vi.mock("react-router", () => ({
  redirect: vi.fn(),
}));

// Mock config/auth
vi.mock("~/config/auth", () => ({
  AUTH_DEFAULT_REDIRECT: "/dashboard",
  AUTH_SESSION_DURATION: 86400, // 24 hours in seconds
}));

// Mock authSessionStore
vi.mock("../authSessionStore", () => ({
  authSessionStore: {
    commitSession: vi.fn(),
  },
}));

// Mock getSession
vi.mock("../getSession", () => ({
  getSession: vi.fn(),
}));

import { redirect } from "react-router";
import { mockServerEnv } from "~/__mocks__/env";
import { createMockSession, type MockSession } from "~/__mocks__/types";
import { authSessionStore } from "../authSessionStore";
import { getSession } from "../getSession";
import { createSession } from "./createSession";

const mockRedirect = vi.mocked(redirect);
const mockAuthSessionStore = vi.mocked(authSessionStore);
const mockGetSession = vi.mocked(getSession);

describe("createSession", () => {
  let mockSession: MockSession;
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSession = createMockSession();

    mockRequest = new Request("http://localhost");

    mockGetSession.mockResolvedValue(mockSession);
    mockAuthSessionStore.commitSession.mockResolvedValue(
      "Set-Cookie: session=abc123; Path=/; HttpOnly",
    );
    mockRedirect.mockReturnValue(new Response(null, { status: 302 }));
  });

  it("creates session with default parameters", async () => {
    // Arrange
    const key = "userId";
    const token = "user-token-123";

    // Act
    const result = await createSession({
      key,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      {
        maxAge: 86400, // AUTH_SESSION_DURATION
      },
    );
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard", {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
    expect(result).toBeInstanceOf(Response);
  });

  it("creates session with custom maxAge", async () => {
    // Arrange
    const key = "sessionToken";
    const token = "custom-token-456";
    const maxAge = 3600; // 1 hour

    // Act
    await createSession({
      key,
      maxAge,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      {
        maxAge,
      },
    );
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard", {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
  });

  it("creates session with custom redirectTo", async () => {
    // Arrange
    const key = "authToken";
    const token = "auth-token-789";
    const redirectTo = "/profile";

    // Act
    await createSession({
      key,
      redirectTo,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      {
        maxAge: 86400, // Default AUTH_SESSION_DURATION
      },
    );
    expect(mockRedirect).toHaveBeenCalledWith(redirectTo, {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
  });

  it("creates session with all custom parameters", async () => {
    // Arrange
    const key = "customKey";
    const token = "custom-token-000";
    const maxAge = 7200; // 2 hours
    const redirectTo = "/custom-page";

    // Act
    await createSession({
      key,
      maxAge,
      redirectTo,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      {
        maxAge,
      },
    );
    expect(mockRedirect).toHaveBeenCalledWith(redirectTo, {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
  });

  it("handles session setting correctly", async () => {
    // Arrange
    const key = "accessToken";
    const token = "access-token-111";

    // Act
    await createSession({
      key,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledTimes(1);
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
  });

  it("handles commit session correctly", async () => {
    // Arrange
    const key = "refreshToken";
    const token = "refresh-token-222";
    const maxAge = 1800; // 30 minutes

    // Act
    await createSession({
      key,
      maxAge,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledTimes(1);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      { maxAge },
    );
  });

  it("handles redirect response correctly", async () => {
    // Arrange
    const key = "sessionId";
    const token = "session-id-333";
    const redirectTo = "/welcome";
    const cookieHeader = "Set-Cookie: session=xyz789; Path=/; Secure";

    mockAuthSessionStore.commitSession.mockResolvedValue(cookieHeader);

    // Act
    await createSession({
      key,
      redirectTo,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith(redirectTo, {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  });

  it("propagates errors from getSession", async () => {
    // Arrange
    const key = "errorKey";
    const token = "error-token";
    const error = new Error("Failed to get session");

    mockGetSession.mockRejectedValue(error);

    // Act & Assert
    await expect(
      createSession({
        key,
        request: mockRequest,
        token,
      }),
    ).rejects.toThrow("Failed to get session");

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).not.toHaveBeenCalled();
    expect(mockAuthSessionStore.commitSession).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("propagates errors from commitSession", async () => {
    // Arrange
    const key = "commitErrorKey";
    const token = "commit-error-token";
    const error = new Error("Failed to commit session");

    mockAuthSessionStore.commitSession.mockRejectedValue(error);

    // Act & Assert
    await expect(
      createSession({
        key,
        request: mockRequest,
        token,
      }),
    ).rejects.toThrow("Failed to commit session");

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith(key, token);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      { maxAge: 86400 },
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("handles maxAge of 0 correctly", async () => {
    // Arrange
    const key = "zeroMaxAge";
    const token = "zero-token";
    const maxAge = 0;

    // Act
    await createSession({
      key,
      maxAge,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      {
        maxAge: 0,
      },
    );
  });

  it("handles empty string redirectTo", async () => {
    // Arrange
    const key = "emptyRedirect";
    const token = "empty-redirect-token";
    const redirectTo = "";

    // Act
    await createSession({
      key,
      redirectTo,
      request: mockRequest,
      token,
    });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("", {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
  });
});
