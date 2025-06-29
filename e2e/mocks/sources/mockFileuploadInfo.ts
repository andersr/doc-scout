import type { SignedUrlResponseFileInfo } from "~/types/files";
import { MOCK_SOURCE } from "./mockSource";

export const mockFileuploadInfo: SignedUrlResponseFileInfo = {
  fileName: MOCK_SOURCE.fileName,
  signedUrl: "https://foo",
  sourcePublicId: MOCK_SOURCE.publicId,
  storagePath: MOCK_SOURCE.storagePath,
};
