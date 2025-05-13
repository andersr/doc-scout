import { prisma } from "~/lib/prisma";
import { USER_INCLUDE } from "~/types/user";
import { clerkLogout } from "../clerk/clerkLogout";

/**
 * Attempts to find a user with the specified clerkId in the database.
 * If the user is not found, it will retry up to 10 times with a 250ms delay between attempts.
 * This is needed because there is a delay between the time Clerk creates a user and the update to the app db via the Clerk webhook.
 * After 10 failed attempts, it will throw an error.
 *
 * @param clerkId The Clerk ID of the user to find
 * @returns The user object if found
 * @throws Error if the user is not found after 10 attempts
 */
export async function waitForUser(clerkId: string) {
  const MAX_ATTEMPTS = 10;
  const RETRY_DELAY_MS = 250;

  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      include: USER_INCLUDE,
    });

    if (user) {
      return user;
    }

    // If this was the last attempt, don't wait
    if (attempts >= MAX_ATTEMPTS) {
      break;
    }

    // Wait before trying again
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  console.warn("failed to acquire app user via clerk id, signing out...");
  throw await clerkLogout(clerkId);
  // const sessions = await clerkClient.sessions.getSessionList({
  //   userId: clerkId,
  // });
  // const sessionId =
  //   sessions && sessions.data.length > 0 ? sessions.data[0].id : undefined;

  // if (sessionId) {
  //   await clerkClient.sessions.revokeSession(sessionId);
  //   throw redirect(appRoutes("/login"));
  // }

  // throw new Error(
  //   `User with clerkId ${clerkId} not found after ${MAX_ATTEMPTS} attempts`,
  // );
}
