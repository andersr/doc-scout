import type { Source } from "@prisma/client";
import { requireUser } from "~/.server/sessions/requireUser";
import { prisma } from "~/lib/prisma";
import { sourceIdListSchema } from "~/lib/schemas/files";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";

export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  // const submittedFiles = formData
  //   .getAll(KEYS.files)
  //   .filter((f) => f instanceof File);
  const items = formData.getAll(KEYS.ids);

  const ids = sourceIdListSchema.parse(items);

  // await throwIfExistingSources({
  //   files,
  //   userId: internalUser.id,
  // });

  // const filesDbInput: FileSourceInput[] = [];

  const sources: Source[] = [];

  // allow CDN to update
  // await asyncDelay(1000);

  for await (const id of ids) {
    const source = await prisma.source.findFirst({
      where: {
        publicId: id,
      },
    });

    if (!source) {
      console.warn(`No source found for id: ${id}`);
      continue;
    }

    if (!source.storagePath) {
      console.warn(`No storage path found for id: ${id}`);
      continue;
    }

    // await extractText(source.storagePath);
    // const url = `${ENV.CDN_HOST}/${source.storagePath}`;

    // const text = await extractTextFromPdfUrl(url);
    // const summary = await generateAbstract({ text });

    // const file = await getFileFromS3(source.storagePath);
    // const fileData = await getFromBucket(source.storagePath);
    // console.log("fileData: ", fileData);
    // const publicId = generateId();
    // const storagePath = generateS3Key({
    //   fileName: file.name,
    //   sourcePublicId: publicId,
    //   userPublicId: internalUser.publicId,
    // });

    // await uploadFileToS3({ file, key: storagePath });

    // const text = await extractTextFromFile(file);
    // const summary = await generateAbstract({ text });

    // await prisma.source.update({
    //   data: {
    //     // summary,
    //     text,
    //   },
    //   where: {
    //     id: source.id,
    //   },
    // });

    // sources.push(source);

    // filesDbInput.push({
    //   fileName: file.name,
    //   ownerId: internalUser.id,
    //   publicId,
    //   storagePath,
    //   summary,
    //   text,
    //   title: file.name, // TODO: get from file content or suggest via bot
    // });
  }

  // await addSourcesToVectorStore({
  //   sources,
  //   userPublicId: internalUser.publicId,
  // });

  // const redirectRoute =
  //   sources.length === 1
  //     ? appRoutes("/docs/:id", { id: sources[0].publicId })
  //     : appRoutes("/docs");

  // return redirect(redirectRoute);
  return null;
};
