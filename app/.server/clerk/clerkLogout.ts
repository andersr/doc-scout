import { redirect } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { clerkClient } from "./clerk";

export async function clerkLogout(clerkId: string) {
  const sessions = await clerkClient.sessions.getSessionList({
    userId: clerkId,
  });
  const sessionId =
    sessions && sessions.data.length > 0 ? sessions.data[0].id : undefined;

  if (!sessionId) {
    throw new Error(`Error signing out from Clerk`);
  }
  await clerkClient.sessions.revokeSession(sessionId);
  throw redirect(appRoutes("/login"));
}
