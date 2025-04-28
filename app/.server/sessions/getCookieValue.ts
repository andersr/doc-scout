import { getSessionCookie } from "./getSessionCookie";

export async function getCookieValue({
  request,
  key,
}: {
  request: Request;
  key: string;
}): Promise<string | undefined> {
  const cookie = await getSessionCookie({ request });
  return cookie.get(key);
}
