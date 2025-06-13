import { vi } from "vitest";
import type { Session, SessionStorage } from "react-router";

/**
 * Shared mock session interface for tests
 * Extends React Router's Session with mock function types
 */
export interface MockSession extends Session {
  data: Record<string, unknown>;
  flash: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  id: string;
  set: ReturnType<typeof vi.fn>;
  unset: ReturnType<typeof vi.fn>;
}

/**
 * Shared mock session storage interface for tests
 * Extends React Router's SessionStorage with mock function types
 */
export interface MockSessionStorage extends SessionStorage {
  commitSession: ReturnType<typeof vi.fn>;
  destroySession: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
}

/**
 * Factory function to create a mock session with default values
 * @param overrides - Optional properties to override defaults
 * @returns MockSession instance
 */
export function createMockSession(
  overrides: Partial<MockSession> = {},
): MockSession {
  return {
    data: {},
    flash: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    id: "test-session-id",
    set: vi.fn(),
    unset: vi.fn(),
    ...overrides,
  };
}

/**
 * Factory function to create a mock session storage with default values
 * @param overrides - Optional properties to override defaults
 * @returns MockSessionStorage instance
 */
export function createMockSessionStorage(
  overrides: Partial<MockSessionStorage> = {},
): MockSessionStorage {
  return {
    commitSession: vi.fn().mockResolvedValue("Set-Cookie: session=abc123"),
    destroySession: vi
      .fn()
      .mockResolvedValue(
        "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      ),
    getSession: vi.fn().mockResolvedValue(createMockSession()),
    ...overrides,
  };
}
