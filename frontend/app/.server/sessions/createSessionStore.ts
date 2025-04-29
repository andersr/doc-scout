import type { SessionIdStorageStrategy } from "react-router";
import { createCookieSessionStorage } from "react-router";

export function createSessionStore(config: SessionIdStorageStrategy["cookie"]) {
  const newSession = createCookieSessionStorage({
    cookie: config,
  });

  // src: epic-stack
  // we have to do this because every time you commit the session you overwrite it
  // so we store the expiration time in the cookie and reset it every time we commit
  const originalCommit = newSession.commitSession;
  Object.defineProperty(newSession, "commitSession", {
    value: async function commitSession(
      ...args: Parameters<typeof originalCommit>
    ) {
      const [session, options] = args;
      if (options?.expires) {
        session.set("expires", options.expires);
      }
      if (options?.maxAge) {
        session.set("expires", new Date(Date.now() + options.maxAge * 1000));
      }
      const expires = session.has("expires")
        ? new Date(session.get("expires"))
        : undefined;
      const setCookieHeader = await originalCommit(session, {
        ...options,
        expires,
      });
      return setCookieHeader;
    },
  });

  return newSession;
}
