import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock ENV module to prevent validation errors
mockServerEnv();

// Mock react-router redirect
vi.mock("react-router", () => ({
  redirect: vi.fn(),
}));

// Mock appRoutes
vi.mock("~/shared/appRoutes", () => ({
  appRoutes: vi.fn(),
}));

// Mock authSessionStore
vi.mock("../authSessionStore", () => ({
  authSessionStore: {
    destroySession: vi.fn(),
  },
}));

// Mock getSession
vi.mock("../getSession", () => ({
  getSession: vi.fn(),
}));

import { redirect } from "react-router";
import { mockServerEnv } from "~/__mocks__/env";
import { createMockSession, type MockSession } from "~/__mocks__/types";
import { appRoutes } from "~/shared/appRoutes";
import { authSessionStore } from "../authSessionStore";
import { getSession } from "../getSession";
import { logout } from "./logout";

const mockRedirect = vi.mocked(redirect);
const mockAppRoutes = vi.mocked(appRoutes);
const mockAuthSessionStore = vi.mocked(authSessionStore);
const mockGetSession = vi.mocked(getSession);

describe("logout", () => {
  let mockSession: MockSession;
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSession = createMockSession({ data: { userId: "123" } });

    mockRequest = new Request("http://localhost", {
      headers: { Cookie: "session=abc123" },
    });

    mockGetSession.mockResolvedValue(mockSession);
    mockAuthSessionStore.destroySession.mockResolvedValue(
      "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );
    mockAppRoutes.mockReturnValue("/login?error=true");
    mockRedirect.mockReturnValue(new Response(null, { status: 302 }));
  });

  it("destroys session and redirects to login with error parameter", async () => {
    // Act
    const result = await logout({ request: mockRequest });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      mockSession,
    );
    expect(mockAppRoutes).toHaveBeenCalledWith("/login", { error: "true" });
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=true", {
      headers: {
        "Set-Cookie": "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    });
    expect(result).toBeInstanceOf(Response);
  });

  it("handles session destruction correctly", async () => {
    // Arrange
    const destroySessionResult = "custom-destroy-cookie";
    mockAuthSessionStore.destroySession.mockResolvedValue(destroySessionResult);

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledTimes(1);
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      mockSession,
    );
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=true", {
      headers: {
        "Set-Cookie": destroySessionResult,
      },
    });
  });

  it("passes correct parameters to appRoutes", async () => {
    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockAppRoutes).toHaveBeenCalledTimes(1);
    expect(mockAppRoutes).toHaveBeenCalledWith("/login", { error: "true" });
  });

  it("sets correct Set-Cookie header for session destruction", async () => {
    // Arrange
    const expectedCookie = "session=; HttpOnly; Path=/; SameSite=Lax; Secure";
    mockAuthSessionStore.destroySession.mockResolvedValue(expectedCookie);

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=true", {
      headers: {
        "Set-Cookie": expectedCookie,
      },
    });
  });

  it("handles different request objects correctly", async () => {
    // Arrange
    const customRequest = new Request("http://example.com/dashboard", {
      headers: {
        Cookie: "session=xyz789; other=value",
        "User-Agent": "test-agent",
      },
    });

    // Act
    await logout({ request: customRequest });

    // Assert
    expect(mockGetSession).toHaveBeenCalledWith({ request: customRequest });
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      mockSession,
    );
  });

  it("propagates errors from getSession", async () => {
    // Arrange
    const error = new Error("Failed to get session");
    mockGetSession.mockRejectedValue(error);

    // Act & Assert
    await expect(logout({ request: mockRequest })).rejects.toThrow(
      "Failed to get session",
    );

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockAuthSessionStore.destroySession).not.toHaveBeenCalled();
    expect(mockAppRoutes).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("propagates errors from destroySession", async () => {
    // Arrange
    const error = new Error("Failed to destroy session");
    mockAuthSessionStore.destroySession.mockRejectedValue(error);

    // Act & Assert
    await expect(logout({ request: mockRequest })).rejects.toThrow(
      "Failed to destroy session",
    );

    expect(mockGetSession).toHaveBeenCalledWith({ request: mockRequest });
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      mockSession,
    );
    expect(mockAppRoutes).toHaveBeenCalledWith("/login", { error: "true" });
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("handles empty session correctly", async () => {
    // Arrange
    const emptySession = createMockSession({ data: {}, id: "" });
    mockGetSession.mockResolvedValue(emptySession);

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      emptySession,
    );
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=true", {
      headers: {
        "Set-Cookie": "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    });
  });

  it("handles session with different data correctly", async () => {
    // Arrange
    const sessionWithData = createMockSession({
      data: { preferences: { theme: "dark" }, role: "admin", userId: "456" },
      id: "admin-session-id",
    });
    mockGetSession.mockResolvedValue(sessionWithData);

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockAuthSessionStore.destroySession).toHaveBeenCalledWith(
      sessionWithData,
    );
  });

  it("always redirects to login with error=true parameter", async () => {
    // Arrange
    const loginUrl = "/custom-login?error=true&redirect=/dashboard";
    mockAppRoutes.mockReturnValue(loginUrl);

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(mockAppRoutes).toHaveBeenCalledWith("/login", { error: "true" });
    expect(mockRedirect).toHaveBeenCalledWith(loginUrl, {
      headers: {
        "Set-Cookie": "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    });
  });

  it("calls functions in correct order", async () => {
    // Arrange
    const callOrder: string[] = [];

    mockGetSession.mockImplementation(async () => {
      callOrder.push("getSession");
      return mockSession;
    });

    mockAuthSessionStore.destroySession.mockImplementation(async () => {
      callOrder.push("destroySession");
      return "cookie";
    });

    mockAppRoutes.mockImplementation(() => {
      callOrder.push("appRoutes");
      return "/login?error=true";
    });

    mockRedirect.mockImplementation(() => {
      callOrder.push("redirect");
      return new Response(null, { status: 302 });
    });

    // Act
    await logout({ request: mockRequest });

    // Assert
    expect(callOrder).toEqual([
      "getSession",
      "appRoutes",
      "destroySession",
      "redirect",
    ]);
  });
});
