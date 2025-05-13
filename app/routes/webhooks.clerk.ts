import { verifyWebhook } from "@clerk/react-router/webhooks";
import { ENV } from "~/.server/ENV";
import { generateId } from "~/.server/utils/generateId";
import { isAllowedUser } from "~/.server/utils/isAllowedUser";
import { prisma } from "~/lib/prisma";
import type { Route } from "./+types/webhooks.clerk";

export const action = async (args: Route.ActionArgs) => {
  try {
    const evt = await verifyWebhook(args.request);

    if (evt.type === "user.created") {
      const clerkEmail =
        evt.data.email_addresses.length > 0
          ? evt.data.email_addresses[0].email_address
          : undefined;

      if (!clerkEmail) {
        throw new Error("No clerk email found, cannot verify user.");
      }

      const allowedUser = isAllowedUser(clerkEmail, ENV.ALLOWED_USERS);

      if (!allowedUser) {
        throw new Error("User not allowed.");
      }

      const clerkId = evt.data.id;

      await prisma.user.upsert({
        where: {
          clerkId,
        },
        create: {
          publicId: generateId(),
          clerkId,
        },
        update: {},
      });
    }

    if (evt.type === "user.deleted") {
      await prisma.user.delete({
        where: {
          clerkId: evt.data.id,
        },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
};
