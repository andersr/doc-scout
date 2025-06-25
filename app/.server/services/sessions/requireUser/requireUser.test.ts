import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockServerEnv } from "../../../../__mocks__/env";

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

// Mock prisma
vi.mock("~/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock appRoutes
vi.mock("~/shared/appRoutes", () => ({
  appRoutes: vi.fn(),
}));

// Mock user types
vi.mock("~/types/user", () => ({
  USER_INTERNAL_INCLUDE: { chats: true, sources: true },
}));

// Mock stytch client
vi.mock("~/.server/vendors/stytch/client", () => ({
  stytchClient: {
    sessions: {
      authenticate: vi.fn(),
    },
  },
}));

// Mock getCookieValue
vi.mock("~/.server/services/sessions/getCookieValue", () => ({
  getCookieValue: vi.fn(),
}));

// Mock logout
vi.mock("~/.server/services/sessions/logout", () => ({
  logout: vi.fn(),
}));

import { redirect } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { USER_INTERNAL_INCLUDE } from "~/types/user";

import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { logout } from "~/.server/services/sessions/logout";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { requireUser } from "./requireUser";

const mockRedirect = vi.mocked(redirect);
const mockAppRoutes = vi.mocked(appRoutes);
const mockGetCookieValue = vi.mocked(getCookieValue);
const mockLogout = vi.mocked(logout);

// Type the mocked functions properly
const mockStytchAuthenticate = vi.fn();
const mockPrismaUserFindUnique = vi.fn();

// Assign the mock functions to the actual objects
Object.assign(stytchClient.sessions, { authenticate: mockStytchAuthenticate });
Object.assign(prisma.user, { findUnique: mockPrismaUserFindUnique });

// Define proper types for test mocks
interface MockStytchResponse {
  status_code: number;
  user?: {
    emails: Array<{ email: string }>;
    user_id: string | null;
  } | null;
}

interface MockUserInternal {
  chats: unknown[];
  email: string;
  id: string;
  publicId: string;
  sources: unknown[];
  stytchId: string;
}

describe("requireUser", () => {
  let mockRequest: Request;
  let mockStytchResponse: MockStytchResponse;
  let mockUser: MockUserInternal;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mockRequest = new Request("http://localhost/dashboard");

    mockStytchResponse = {
      status_code: 200,
      user: {
        emails: [{ email: "test@example.com" }],
        user_id: "user-123",
      },
    };

    mockUser = {
      chats: [],
      email: "test@example.com",
      id: "internal-user-123",
      publicId: "pub-123",
      sources: [],
      stytchId: "user-123",
    };

    mockAppRoutes.mockReturnValue("/login");
    mockRedirect.mockReturnValue(new Response(null, { status: 302 }));
    mockLogout.mockResolvedValue(new Response(null, { status: 302 }));
    mockGetCookieValue.mockResolvedValue("valid-session-token");
    mockStytchAuthenticate.mockResolvedValue(mockStytchResponse);
    mockPrismaUserFindUnique.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns user data for valid authenticated user", async () => {
    // Act
    const result = await requireUser({ request: mockRequest });

    // Assert
    expect(result).toEqual({
      clientUser: {
        // email: "test@example.com",
        publicId: "pub-123",
      },
      internalUser: mockUser,
    });

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockStytchAuthenticate).toHaveBeenCalledWith({
      session_token: "valid-session-token",
    });
    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      include: USER_INTERNAL_INCLUDE,
      where: { stytchId: "user-123" },
    });
  });

  it("redirects to login when no session token", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue(undefined);

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: mockRequest,
    });
    expect(mockAppRoutes).toHaveBeenCalledWith("/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
    expect(mockStytchAuthenticate).not.toHaveBeenCalled();
  });

  it("redirects to login when empty session token", async () => {
    // Arrange
    mockGetCookieValue.mockResolvedValue("");

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockAppRoutes).toHaveBeenCalledWith("/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
    expect(mockStytchAuthenticate).not.toHaveBeenCalled();
  });

  it("logs out user when session authentication fails", async () => {
    // Arrange
    mockStytchAuthenticate.mockResolvedValue({
      status_code: 401,
    });

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockStytchAuthenticate).toHaveBeenCalledWith({
      session_token: "valid-session-token",
    });
    expect(console.info).toHaveBeenCalledWith("Session invalid or expired");
    expect(mockLogout).toHaveBeenCalledWith({ request: mockRequest });
  });

  it("redirects to login when no user in stytch response", async () => {
    // Arrange
    mockStytchAuthenticate.mockResolvedValue({
      status_code: 200,
      user: null,
    });

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(console.error).toHaveBeenCalledWith("No user found");
    expect(mockAppRoutes).toHaveBeenCalledWith("/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to login when no user_id in stytch response", async () => {
    // Arrange
    mockStytchAuthenticate.mockResolvedValue({
      status_code: 200,
      user: { user_id: null },
    });

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(console.error).toHaveBeenCalledWith("No user found");
    expect(mockAppRoutes).toHaveBeenCalledWith("/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("logs out user when user not found in database", async () => {
    // Arrange
    mockPrismaUserFindUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      include: USER_INTERNAL_INCLUDE,
      where: { stytchId: "user-123" },
    });
    expect(console.error).toHaveBeenCalledWith("No user in db");
    expect(mockLogout).toHaveBeenCalledWith({ request: mockRequest });
  });

  it("logs out user when stytch authentication throws error", async () => {
    // Arrange
    const error = new Error("Stytch error");
    mockStytchAuthenticate.mockRejectedValue(error);

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(console.error).toHaveBeenCalledWith("error: ", error);
    expect(mockLogout).toHaveBeenCalledWith({ request: mockRequest });
  });

  it("logs out user when database query throws error", async () => {
    // Arrange
    const error = new Error("Database error");
    mockPrismaUserFindUnique.mockRejectedValue(error);

    // Act & Assert
    await expect(requireUser({ request: mockRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(console.error).toHaveBeenCalledWith("error: ", error);
    expect(mockLogout).toHaveBeenCalledWith({ request: mockRequest });
  });

  it("handles different session token values", async () => {
    // Arrange
    const customToken = "custom-session-token-123";
    mockGetCookieValue.mockResolvedValue(customToken);

    // Act
    await requireUser({ request: mockRequest });

    // Assert
    expect(mockStytchAuthenticate).toHaveBeenCalledWith({
      session_token: customToken,
    });
  });

  it("passes correct request object to getCookieValue", async () => {
    // Arrange
    const customRequest = new Request("http://example.com/profile", {
      headers: { Cookie: "session=test" },
    });

    // Act
    await requireUser({ request: customRequest });

    // Assert
    expect(mockGetCookieValue).toHaveBeenCalledWith({
      key: STYTCH_SESSION_TOKEN,
      request: customRequest,
    });
  });

  it("passes correct request object to logout on error", async () => {
    // Arrange
    const customRequest = new Request("http://example.com/profile");
    mockStytchAuthenticate.mockRejectedValue(new Error("Test error"));

    // Act & Assert
    await expect(requireUser({ request: customRequest })).rejects.toEqual(
      new Response(null, { status: 302 }),
    );

    expect(mockLogout).toHaveBeenCalledWith({ request: customRequest });
  });

  it("includes correct user data in internal include", async () => {
    // Act
    await requireUser({ request: mockRequest });

    // Assert
    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      include: USER_INTERNAL_INCLUDE,
      where: { stytchId: "user-123" },
    });
  });

  it.skip("returns correct client user structure", async () => {
    // Act
    const result = await requireUser({ request: mockRequest });

    // Assert
    expect(result.clientUser).toEqual({
      email: "test@example.com",
      publicId: "pub-123",
    });
    expect(result.clientUser).not.toHaveProperty("stytchId");
    expect(result.clientUser).not.toHaveProperty("id");
  });

  it("returns complete internal user object", async () => {
    // Act
    const result = await requireUser({ request: mockRequest });

    // Assert
    expect(result.internalUser).toBe(mockUser);
    expect(result.internalUser).toHaveProperty("id");
    expect(result.internalUser).toHaveProperty("stytchId");
    expect(result.internalUser).toHaveProperty("sources");
    expect(result.internalUser).toHaveProperty("chats");
  });

  it("handles various stytch status codes correctly", async () => {
    const statusCodes = [400, 401, 403, 404, 500];

    for (const statusCode of statusCodes) {
      // Arrange
      vi.clearAllMocks();
      mockStytchAuthenticate.mockResolvedValue({
        status_code: statusCode,
      });

      // Act & Assert
      await expect(requireUser({ request: mockRequest })).rejects.toEqual(
        new Response(null, { status: 302 }),
      );

      expect(console.info).toHaveBeenCalledWith("Session invalid or expired");
      expect(mockLogout).toHaveBeenCalledWith({ request: mockRequest });
    }
  });
});
