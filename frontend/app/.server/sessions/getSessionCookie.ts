import { authSessionStore } from "./authSessionStore";

export async function getSessionCookie({ request }: { request: Request }) {
  const cookie = request.headers.get("Cookie");
  return await authSessionStore.getSession(cookie);
}
