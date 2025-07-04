import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import { deleteSourcesByNameSchema } from "../utils/e2eSchemas";

export const deleteSourcesByNameAction: ActionHandlerFn = async ({
  formData,
}) => {
  const formPayload = Object.fromEntries(formData);
  const data = deleteSourcesByNameSchema.parse(formPayload);

  await prisma.source.deleteMany({
    where: {
      name: {
        in: data.sourceNames,
      },
    },
  });

  return null;
};
