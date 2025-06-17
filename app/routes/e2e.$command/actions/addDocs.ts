import { nanoid } from "nanoid";
import { TEST_KEYS } from "~/__test__/keys";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import { MOCK_FILE_PDF_SOURCE } from "../../../__mocks__/sources";

export const addDocs: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const username = formPayload[TEST_KEYS.username];

  if (!username) {
    throw new Error("no username");
  }

  const user = await prisma.user.findFirstOrThrow({
    where: {
      username: username.toString(),
    },
  });

  await prisma.source.create({
    data: {
      ...MOCK_FILE_PDF_SOURCE,
      createdAt: new Date(),
      ownerId: user.id,
      publicId: nanoid(),
    },
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
  });
};
