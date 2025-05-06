import { redirect } from "react-router";
import { AUTH_USER_KEY } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import type { DataRequest } from "~/types/dataRequest";
import { getCookieValue } from "../sessions/getCookieValue";

export async function getUserPublicId({ request, require }: DataRequest) {
  const publicId = await getCookieValue({ request, key: AUTH_USER_KEY });

  if (require && !publicId) {
    throw redirect(appRoutes("/login"));
  }

  return publicId as string;
}

export async function requireUserPublicId({ request }: DataRequest) {
  const publicId = await getCookieValue({ request, key: AUTH_USER_KEY });

  if (!publicId) {
    throw redirect(appRoutes("/login"));
  }

  return publicId as string;
}
