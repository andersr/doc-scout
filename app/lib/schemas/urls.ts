import { z } from "zod";
import { FILE_CONFIG as CONFIG } from "~/config/files";
import { isValidUrl } from "~/utils/isValidUrl";

export const urlSchema = z.string().refine((val) => isValidUrl(val), {
  message: `Not a valid URL`,
});

export const urlListSchema = z
  .array(urlSchema)
  .refine((list) => list.length > 0, "No urls selected")
  .refine(
    (list) => list.length <= CONFIG.maxFiles,
    `Maximum ${CONFIG.maxFiles} files allowed`,
  );
