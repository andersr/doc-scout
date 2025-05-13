import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { waitForUser } from "./waitForUser";

export async function requireUser(args: LoaderFunctionArgs) {
  const { userId: clerkId } = await getAuth(args);

  if (!clerkId) {
    throw redirect(appRoutes("/login"));
  }

  const user = await waitForUser(clerkId);

  return user;
}
