import { redirect } from "react-router";
import { AUTH_USER_KEY } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { prisma } from "../db";
import { destroySession } from "./destroySession";
import { getCookieValue } from "./getCookieValue";

export async function requireUser({
  request,
}: {
  request: Request;
  // redirectTo?: string;
}) {
  const publicId = await getCookieValue({ request, key: AUTH_USER_KEY });

  if (!publicId) {
    throw redirect(appRoutes("/login"));
  }

  const user = await prisma.user.findFirst({
    where: {
      publicId: publicId ?? "",
    },
  });

  // a public id was found in the session, but no matching user was found in the db (the user may have been deleted)
  if (!user) {
    console.warn(`No matching user found for public id: ${publicId}`);
    // TODO: display error message on login page
    throw await destroySession({ request });
  }

  return user;
}
