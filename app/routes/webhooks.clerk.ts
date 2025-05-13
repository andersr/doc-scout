import { verifyWebhook } from "@clerk/react-router/webhooks";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
import type { Route } from "./+types/webhooks.clerk";

export const action = async (args: Route.ActionArgs) => {
  try {
    const evt = await verifyWebhook(args.request);

    if (evt.type === "user.created") {
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
