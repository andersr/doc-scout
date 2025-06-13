import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockServerEnv } from "../../../__mocks__/env";

// Mock ENV module to prevent validation errors
mockServerEnv();

// Mock react-router redirect
vi.mock("react-router", () => ({
  redirect: vi.fn(),
}));

// Mock config/auth
vi.mock("~/config/auth", () => ({
  STYTCH_SESSION_TOKEN: "stytch_session",
}));

// Mock appRoutes
vi.mock("~/shared/appRoutes", () => ({
  appRoutes: vi.fn(),
}));

// Mock getCookieValue
vi.mock("~/.server/services/sessions/getCookieValue", () => ({
  getCookieValue: vi.fn(),
}));

import { redirect } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";

import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { requireAnon } from "./requireAnon";

const mockRedirect = vi.mocked(redirect);
const mockAppRoutes = vi.mocked(appRoutes);
const mockGetCookieValue = vi.mocked(getCookieValue);

describe("requireAnon", () => {
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = new Request("http://localhost/login");

    mockAppRoutes.mockReturnValue("/dashboard");
    mockRedirect.mockReturnValue(new Response(null, { status: 302 }));
  });

  it("allows anonymous users to proceed (no session token)", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act & Assert - should not throw
    await expect(
      requireAnon({ request: mockRequest }),
    ).resolves.toBeUndefined();

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("allows anonymous users to proceed (undefined session token)", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act & Assert - should not throw
    await expect(
      requireAnon({ request: mockRequest }),
    ).resolves.toBeUndefined();

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("allows anonymous users to proceed (empty string session token)", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue("");

    // Act & Assert - should not throw
    await expect(
      requireAnon({ request: mockRequest }),
    ).resolves.toBeUndefined();

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to home page", async () => {
    // Arrange
    const sessionToken = "valid-session-token-123";
    mockGetCookieValue.mockResolvedValue(sessionToken);

    // Act & Assert - should throw redirect
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).toHaveBeenCalledWith("/");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects users with any non-empty session token", async () => {
    // Arrange
    const sessionToken = "any-token";
    mockGetCookieValue.mockResolvedValue(sessionToken);

    // Act & Assert - should throw redirect
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).toHaveBeenCalledWith("/");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("handles long session tokens correctly", async () => {
    // Arrange
    const longToken = "a".repeat(1000);
    mockGetCookieValue.mockResolvedValue(longToken);

    // Act & Assert - should throw redirect
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).toHaveBeenCalledWith("/");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("handles special character session tokens correctly", async () => {
    // Arrange
    const specialToken = "token-with-special-chars-!@#$%^&*()";
    mockGetCookieValue.mockResolvedValue(specialToken);

    // Act & Assert - should throw redirect
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
  });

  it("uses correct session token key from config", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act
    await requireAnon({ request: mockRequest });

    // Assert
    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: "stytch_session", // STYTCH_SESSION_TOKEN mock value
      request: mockRequest,
    });
  });

  it("passes correct request object to getCookieValue", async () => {
    // Arrange
    const customRequest = new Request("http://example.com/signup", {
      headers: {
        Cookie: "other=value",
        "User-Agent": "test-agent",
      },
    });
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act
    await requireAnon({ request: customRequest });

    // Assert
    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: customRequest,
    });
  });

  it("calls appRoutes with correct path for redirect", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue("session-token");

    // Act & Assert
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockAppRoutes).toHaveBeenCalledTimes(1);
    expect(mockAppRoutes).toHaveBeenCalledWith("/");
  });

  it("handles custom home route from appRoutes", async () => {
    // Arrange
    const customHomeRoute = "/custom-dashboard";
    mockGetCookieValue.mockResolvedValue("session-token");
    mockAppRoutes.mockReturnValue(customHomeRoute);

    // Act & Assert
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockAppRoutes).toHaveBeenCalledWith("/");
    expect(mockRedirect).toHaveBeenCalledWith(customHomeRoute);
  });

  it("propagates errors from getCookieValue", async () => {
    // Arrange
    const error = new Error("Failed to get cookie value");
    mockGetCookieValue.mockRejectedValue(error);

    // Act & Assert
    await expect(requireAnon({ request: mockRequest })).rejects.toThrow(
      "Failed to get cookie value",
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("propagates errors from appRoutes", async () => {
    // Arrange
    const error = new Error("Failed to generate route");
    mockGetCookieValue.mockResolvedValue("session-token");
    mockAppRoutes.mockImplementation(() => {
      throw error;
    });

    // Act & Assert
    await expect(requireAnon({ request: mockRequest })).rejects.toThrow(
      "Failed to generate route",
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).toHaveBeenCalledWith("/");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("returns Promise<void> for anonymous users", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act
    const result = await requireAnon({ request: mockRequest });

    // Assert
    expect(result).toBeUndefined();
  });

  it("maintains async behavior correctly", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act
    const resultPromise = requireAnon({ request: mockRequest });

    // Assert
    expect(resultPromise).toBeInstanceOf(Promise);
    const result = await resultPromise;
    expect(result).toBeUndefined();
  });

  it("calls functions in correct order for authenticated users", async () => {
    // Arrange
    const callOrder: string[] = [];

    mockGetCookieValue.mockImplementation(async () => {
      callOrder.push("getCookieValue");
      return "session-token";
    });

    mockAppRoutes.mockImplementation(() => {
      callOrder.push("appRoutes");
      return "/dashboard";
    });

    mockRedirect.mockImplementation(() => {
      callOrder.push("redirect");
      throw new Response(null, { status: 302 });
    });

    // Act & Assert
    await expect(requireAnon({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(callOrder).toEqual(["getCookieValue", "appRoutes", "redirect"]);
  });

  it("only calls getCookieValue for anonymous users", async () => {
    // Arrange
    const callOrder: string[] = [];

    mockGetCookieValue.mockImplementation(async () => {
      callOrder.push("getCookieValue");
      return undefined;
    });

    // Act
    await requireAnon({ request: mockRequest });

    // Assert
    expect(callOrder).toEqual(["getCookieValue"]);
  });
});
