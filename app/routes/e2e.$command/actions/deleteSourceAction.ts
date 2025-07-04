import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import { deleteSourceSchema } from "../utils/e2eSchemas";

export const deleteSourceAction: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = deleteSourceSchema.parse(formPayload);

  await prisma.source.delete({
    where: {
      publicId: data.sourcePublicId,
    },
  });

  // TODO: also delete associated Chat (currently is left orphaned)

  return null;
};
