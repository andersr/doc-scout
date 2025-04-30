import type { User } from "@prisma-app/client";
import { AUTH_USER_KEY } from "~/config/auth";
import { prisma } from "../db";
import { getCookieValue } from "./getCookieValue";

export async function maybeUser(request: Request): Promise<null | User> {
  const userPublicId = await getCookieValue({ request, key: AUTH_USER_KEY });

  if (!userPublicId) {
    return null;
  }

  try {
    return await prisma.user.findFirstOrThrow({
      where: { publicId: userPublicId },
    });
  } catch (error) {
    console.warn(
      "user token is in the session but no user found in the db - maybe they were deleted?"
    );
    console.error("maybeUser error: ", error);
    return null;
  }
}
