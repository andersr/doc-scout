import { data } from "react-router";
import { throwIfExistingSources } from "~/.server/models/sources/throwIfExistingSources";
import { createPresignedUrl } from "~/.server/services/cloudStore/createPresignedUrl";
import { generateS3Key } from "~/.server/services/cloudStore/generateS3Key/generateS3Key";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { serverError } from "~/.server/utils/serverError";
import { fileNameListSchema } from "~/lib/schemas/files";
import { KEYS } from "~/shared/keys";
import type {
  SignedUrlResponse,
  SignedUrlResponseFileInfo,
} from "~/types/files";
import type { Route } from "./+types/api.signed-urls";

export async function action(args: Route.ActionArgs) {
  const { internalUser } = await requireUser(args);
  try {
    const formData = await args.request.formData();
    const submittedFiles = formData.getAll(KEYS.fileNames);

    const fileNames = fileNameListSchema.parse(submittedFiles);

    await throwIfExistingSources({
      fileNames,
      userId: internalUser.id,
    });

    const filesInfo: SignedUrlResponseFileInfo[] = [];

    for await (const fileName of fileNames) {
      const sourcePublicId = generateId();
      const storagePath = generateS3Key({
        fileName,
        sourcePublicId,
        userPublicId: internalUser.publicId,
      });

      const signedUrl = await createPresignedUrl({ key: storagePath });

      filesInfo.push({
        fileName,
        signedUrl,
        sourcePublicId,
        storagePath,
      });
    }

    return data({ filesInfo } satisfies SignedUrlResponse, { status: 200 });
  } catch (error) {
    console.error("error: ", error);
    return serverError(error);
  }
}
