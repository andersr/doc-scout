import { getSession } from "~/.server/sessions/getSession";

export async function getCookieValue({
  key,
  request,
}: {
  key: string;
  request: Request;
}): Promise<string | undefined> {
  const session = await getSession({ request });
  return session.get(key);
}
