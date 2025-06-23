import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import type { FileSourceInput } from "~/types/source";
import type { TestActionResponse } from "~/types/testActions";
import { MOCK_SOURCE } from "../../../__mocks__/sources";
import { upsertSourceSchema } from "../utils/e2eSchemas";

export const upsertDoc: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = upsertSourceSchema.parse(formPayload);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: data.email,
    },
  });

  const existingSource = await prisma.source.findFirst({
    where: {
      publicId: data.sourcePublicId,
    },
  });

  if (!existingSource) {
    const sourceInput: FileSourceInput = {
      createdAt: new Date(),
      fileName: MOCK_SOURCE.fileName,
      ownerId: user.id,
      publicId: data.sourcePublicId,
      storagePath: MOCK_SOURCE.storagePath,
      summary: MOCK_SOURCE.summary,
      text: MOCK_SOURCE.text,
      title: MOCK_SOURCE.title,
    };

    const source = await prisma.source.create({
      data: sourceInput,
    });

    await addSourcesToVectorStore({
      sources: [source],
      userPublicId: user.publicId,
    });
  }

  return new Response(
    JSON.stringify({ ok: true } satisfies TestActionResponse),
    {
      status: 200,
    },
  );
};
