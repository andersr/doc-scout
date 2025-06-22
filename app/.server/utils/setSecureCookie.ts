import { ServerError } from "~/types/server";

export function setSecureCookieHeader({
  key,
  value,
}: {
  key: string;
  value: string;
}) {
  const headers = new Headers();
  // TODO: add secure if env is not dev
  headers.set("Set-Cookie", `${key}=${value};HttpOnly;`);

  return headers;
}

export function requireSecureCookieValue({
  key,
  request,
}: {
  key: string;
  request: Request;
}) {
  const cookie = request.headers.getSetCookie();

  const parts = cookie.length > 0 ? cookie[0].split("=") : null;

  if (!parts || parts.length !== 2) {
    console.error("unexpected cookie format");
    throw new ServerError("BAD_REQUEST");
  }

  if (parts[0] !== key) {
    console.error("incorrect cookie fkey");

    throw new ServerError("BAD_REQUEST");
  }

  const valueParts = parts[1];

  return valueParts.split(";")[0];
}
