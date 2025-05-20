import { getSessionCookie } from "./getSessionCookie";

export async function getCookieValue({
  key,
  request,
}: {
  key: string;
  request: Request;
}): Promise<string | undefined> {
  const cookie = await getSessionCookie({ request });
  return cookie.get(key);
}
