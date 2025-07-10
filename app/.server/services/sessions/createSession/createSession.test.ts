import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockServerEnv } from "../../../../__mocks__/env";
import {
  createMockSession,
  type MockSession,
} from "../../../../__mocks__/types";

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
vi.mock("~/.server/services/sessions/authSessionStore", () => ({
  authSessionStore: {
    commitSession: vi.fn(),
  },
}));

// Mock getSession
vi.mock("../getSession", () => ({
  getSession: vi.fn(),
}));

import { redirect } from "react-router";

import { authSessionStore } from "~/.server/services/sessions/authSessionStore";

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
    const sessionToken = "user-token-123";

    // Act
    const result = await createSession({
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
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
    const sessionToken = "custom-token-456";
    const maxAge = 3600; // 1 hour

    // Act
    await createSession({
      maxAge,
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
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
    const sessionToken = "auth-token-789";
    const redirectTo = "/profile";

    // Act
    await createSession({
      redirectTo,
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
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
    const sessionToken = "custom-token-000";
    const maxAge = 7200; // 2 hours
    const redirectTo = "/custom-page";

    // Act
    await createSession({
      maxAge,
      redirectTo,
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
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
    const sessionToken = "access-token-111";

    // Act
    await createSession({
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledTimes(1);
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
  });

  it("handles commit session correctly", async () => {
    // Arrange
    const sessionToken = "refresh-token-222";
    const maxAge = 1800; // 30 minutes

    // Act
    await createSession({
      maxAge,
      request: mockRequest,
      sessionToken,
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
    const sessionToken = "session-id-333";
    const redirectTo = "/welcome";
    const cookieHeader = "Set-Cookie: session=xyz789; Path=/; Secure";

    mockAuthSessionStore.commitSession.mockResolvedValue(cookieHeader);

    // Act
    await createSession({
      redirectTo,
      request: mockRequest,
      sessionToken,
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
    const sessionToken = "error-token";
    const error = new Error("Failed to get session");

    mockGetSession.mockRejectedValue(error);

    // Act & Assert
    await expect(
      createSession({
        request: mockRequest,
        sessionToken,
      }),
    ).rejects.toThrow("Failed to get session");

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).not.toHaveBeenCalled();
    expect(mockAuthSessionStore.commitSession).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("propagates errors from commitSession", async () => {
    // Arrange
    const sessionToken = "commit-error-token";
    const error = new Error("Failed to commit session");

    mockAuthSessionStore.commitSession.mockRejectedValue(error);

    // Act & Assert
    await expect(
      createSession({
        request: mockRequest,
        sessionToken,
      }),
    ).rejects.toThrow("Failed to commit session");

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockSession.set).toHaveBeenCalledWith("session_token", sessionToken);
    expect(mockAuthSessionStore.commitSession).toHaveBeenCalledWith(
      mockSession,
      { maxAge: 86400 },
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("handles maxAge of 0 correctly", async () => {
    // Arrange
    const sessionToken = "zero-token";
    const maxAge = 0;

    // Act
    await createSession({
      maxAge,
      request: mockRequest,
      sessionToken,
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
    const sessionToken = "empty-redirect-token";
    const redirectTo = "";

    // Act
    await createSession({
      redirectTo,
      request: mockRequest,
      sessionToken,
    });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("", {
      headers: {
        "Set-Cookie": "Set-Cookie: session=abc123; Path=/; HttpOnly",
      },
    });
  });
});
