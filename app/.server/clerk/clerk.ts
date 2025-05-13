import { createClerkClient } from "@clerk/react-router/api.server";
import { ENV } from "../ENV";

export const clerkClient = createClerkClient({
  secretKey: ENV.CLERK_SECRET_KEY,
});
