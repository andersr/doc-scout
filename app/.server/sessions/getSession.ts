import { authSessionStore } from "./authSessionStore";

export async function getSession({ request }: { request: Request }) {
  const cookie = request.headers.get("Cookie");
  return await authSessionStore.getSession(cookie);
}
