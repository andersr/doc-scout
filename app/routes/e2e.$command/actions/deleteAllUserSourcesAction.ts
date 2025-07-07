import getFormData from "~/.server/utils/getFormData";
import { getStytchUserByEmail } from "~/.server/vendors/stytch/getStytchUserByEmail";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import { deleteAllUserSourcesSchema } from "../utils/e2eSchemas";

export const deleteAllUserSourcesAction: ActionHandlerFn = async ({
  request,
}) => {
  const formData = await getFormData({ request });
  const data = deleteAllUserSourcesSchema.parse(formData);

  const stytchUser = await getStytchUserByEmail(data.email);

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      stytchId: stytchUser?.user_id ?? "",
    },
  });

  await prisma.source.deleteMany({
    where: {
      ownerId: user.id,
    },
  });

  return null;
};
