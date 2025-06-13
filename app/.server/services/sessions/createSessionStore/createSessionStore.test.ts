import type {
  Session,
  SessionIdStorageStrategy,
  SessionStorage,
} from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionStore } from "./createSessionStore";

// Mock react-router's createCookieSessionStorage
vi.mock("react-router", () => ({
  createCookieSessionStorage: vi.fn(),
}));

import { createCookieSessionStorage } from "react-router";

const mockCreateCookieSessionStorage = vi.mocked(createCookieSessionStorage);

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

interface MockSessionStorage extends SessionStorage {
  commitSession: ReturnType<typeof vi.fn>;
  destroySession: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
}

describe("createSessionStore", () => {
  let mockSession: MockSession;
  let mockSessionStorage: MockSessionStorage;
  let mockOriginalCommit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));

    mockSession = {
      data: {},
      flash: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      id: "test-session-id",
      set: vi.fn(),
      unset: vi.fn(),
    };

    mockOriginalCommit = vi
      .fn()
      .mockResolvedValue("Set-Cookie: session=abc123");

    mockSessionStorage = {
      commitSession: mockOriginalCommit,
      destroySession: vi.fn(),
      getSession: vi.fn(),
    };

    mockCreateCookieSessionStorage.mockReturnValue(mockSessionStorage);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates session store with provided config", () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      httpOnly: true,
      maxAge: 3600,
      name: "test-session",
      sameSite: "lax",
      secrets: ["test-secret"],
      secure: true,
    };

    // Act
    const sessionStore = createSessionStore(config);

    // Assert
    expect(mockCreateCookieSessionStorage).toHaveBeenCalledWith({
      cookie: config,
    });
    expect(sessionStore).toBeDefined();
    expect(sessionStore.getSession).toBe(mockSessionStorage.getSession);
    expect(sessionStore.destroySession).toBe(mockSessionStorage.destroySession);
  });

  it("overrides commitSession method", () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };

    // Act
    const sessionStore = createSessionStore(config);

    // Assert
    expect(sessionStore.commitSession).not.toBe(mockOriginalCommit);
    expect(typeof sessionStore.commitSession).toBe("function");
  });

  it("handles commitSession with expires option", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const expiresDate = new Date("2024-01-01T13:00:00Z");

    mockSession.has.mockReturnValue(true);
    mockSession.get.mockReturnValue(expiresDate);

    // Act
    const result = await sessionStore.commitSession(mockSession, {
      expires: expiresDate,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith("expires", expiresDate);
    expect(mockSession.has).toHaveBeenCalledWith("expires");
    expect(mockSession.get).toHaveBeenCalledWith("expires");
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: expiresDate,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("handles commitSession with maxAge option", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const maxAge = 3600; // 1 hour in seconds
    const expectedExpires = new Date(Date.now() + maxAge * 1000);

    mockSession.has.mockReturnValue(true);
    mockSession.get.mockReturnValue(expectedExpires);

    // Act
    const result = await sessionStore.commitSession(mockSession, {
      maxAge,
    });

    // Assert
    expect(mockSession.set).toHaveBeenCalledWith("expires", expectedExpires);
    expect(mockSession.has).toHaveBeenCalledWith("expires");
    expect(mockSession.get).toHaveBeenCalledWith("expires");
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: expectedExpires,
      maxAge,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("handles commitSession with both expires and maxAge options", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const expiresDate = new Date("2024-01-01T13:00:00Z");
    const maxAge = 3600;
    const expectedMaxAgeExpires = new Date(Date.now() + maxAge * 1000);

    mockSession.has.mockReturnValue(true);
    mockSession.get.mockReturnValue(expectedMaxAgeExpires);

    // Act
    const result = await sessionStore.commitSession(mockSession, {
      expires: expiresDate,
      maxAge,
    });

    // Assert
    // expires should be set first, then overridden by maxAge
    expect(mockSession.set).toHaveBeenCalledWith("expires", expiresDate);
    expect(mockSession.set).toHaveBeenCalledWith(
      "expires",
      expectedMaxAgeExpires,
    );
    expect(mockSession.has).toHaveBeenCalledWith("expires");
    expect(mockSession.get).toHaveBeenCalledWith("expires");
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: expectedMaxAgeExpires,
      maxAge,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("handles commitSession without expiration options", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);

    mockSession.has.mockReturnValue(false);

    // Act
    const result = await sessionStore.commitSession(mockSession, {});

    // Assert
    expect(mockSession.set).not.toHaveBeenCalled();
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: undefined,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("uses existing expires from session when available", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const existingExpires = new Date("2024-01-01T14:00:00Z");

    mockSession.has.mockReturnValue(true);
    mockSession.get.mockReturnValue(existingExpires);

    // Act
    const result = await sessionStore.commitSession(mockSession, {});

    // Assert
    expect(mockSession.has).toHaveBeenCalledWith("expires");
    expect(mockSession.get).toHaveBeenCalledWith("expires");
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: existingExpires,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("handles commitSession with additional options", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const additionalOptions = {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: true,
    };

    mockSession.has.mockReturnValue(false);

    // Act
    const result = await sessionStore.commitSession(
      mockSession,
      additionalOptions,
    );

    // Assert
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      ...additionalOptions,
      expires: undefined,
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });

  it("handles commitSession when originalCommit throws error", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const error = new Error("Commit failed");

    mockOriginalCommit.mockRejectedValue(error);

    // Act & Assert
    await expect(sessionStore.commitSession(mockSession, {})).rejects.toThrow(
      "Commit failed",
    );
  });

  it("preserves all original methods except commitSession", () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };

    // Act
    const sessionStore = createSessionStore(config);

    // Assert
    expect(sessionStore.getSession).toBe(mockSessionStorage.getSession);
    expect(sessionStore.destroySession).toBe(mockSessionStorage.destroySession);
    expect(sessionStore.commitSession).not.toBe(mockOriginalCommit);
  });

  it("handles Date conversion for expires from session", async () => {
    // Arrange
    const config: SessionIdStorageStrategy["cookie"] = {
      name: "test-session",
      secrets: ["test-secret"],
    };
    const sessionStore = createSessionStore(config);
    const expiresString = "2024-01-01T14:00:00Z";

    mockSession.has.mockReturnValue(true);
    mockSession.get.mockReturnValue(expiresString);

    // Act
    const result = await sessionStore.commitSession(mockSession, {});

    // Assert
    expect(mockOriginalCommit).toHaveBeenCalledWith(mockSession, {
      expires: new Date(expiresString),
    });
    expect(result).toBe("Set-Cookie: session=abc123");
  });
});
