import { redirect } from "react-router";
import { AUTH_DEFAULT_REDIRECT, AUTH_USER_KEY } from "~/config/auth";
import { getCookieValue } from "./getCookieValue";

export async function requireAnon(request: Request) {
  const userPublicId = await getCookieValue({ request, key: AUTH_USER_KEY });
  if (userPublicId) {
    throw redirect(AUTH_DEFAULT_REDIRECT);
  }
}
