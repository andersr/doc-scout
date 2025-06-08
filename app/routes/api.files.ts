import { data } from "react-router";
import { createPresignedUrl } from "~/.server/aws/createPresignedUrl";
import { extractTextFromFile } from "~/.server/services/extractTextFromFile";
import { generateS3Key } from "~/.server/services/generateS3Key";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateAbstract } from "~/.server/sources/generateAbstract";
import { throwIfExistingSources } from "~/.server/sources/throwIfExistingSources";
import { generateId } from "~/.server/utils/generateId";
import { serverError } from "~/.server/utils/serverError";
import { addSourcesToVectorStore } from "~/.server/vectorStore/addSourcesToVectorStore";
import { prisma } from "~/lib/prisma";
import { fileListSchema } from "~/lib/schemas/files";
import { KEYS } from "~/shared/keys";
import type { SignedUrlPayload } from "~/types/files";
import type { FileSourceInput } from "~/types/source";
import type { Route } from "./+types/api.messages.generated";

export async function action(args: Route.ActionArgs) {
  const { internalUser } = await requireUser(args);
  try {
    const clone = args.request.clone();
    const formData = await clone.formData();
    const submittedFiles = formData
      .getAll(KEYS.files)
      .filter((f) => f instanceof File);

    const files = fileListSchema.parse(submittedFiles);

    await throwIfExistingSources({
      files,
      userId: internalUser.id,
    });
    const urls: SignedUrlPayload[] = [];
    const filesDbInput: FileSourceInput[] = [];

    for await (const file of files) {
      const sourcePublicId = generateId();
      const storagePath = generateS3Key({
        fileName: file.name,
        sourcePublicId,
        userPublicId: internalUser.publicId,
      });

      const text = await extractTextFromFile(file);
      const summary = await generateAbstract({ text });
      const signedUrl = await createPresignedUrl({ key: storagePath });

      filesDbInput.push({
        fileName: file.name,
        ownerId: internalUser.id,
        publicId: sourcePublicId,
        storagePath,
        summary,
        text,
        title: file.name, // TODO: get from file content or suggest via bot
      });

      urls.push({
        fileName: file.name,
        signedUrl,
        sourcePublicId,
      });
    }

    const sources = await prisma.source.createManyAndReturn({
      data: filesDbInput.map((f) => {
        return {
          ...f,
          createdAt: new Date(),
        };
      }),
    });

    await addSourcesToVectorStore({
      sources,
      userPublicId: internalUser.publicId,
    });

    return data({ urls }, { status: 200 });
  } catch (error) {
    console.error("error: ", error);
    return serverError(error);
  }
}
