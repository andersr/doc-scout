import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FILE_UPLOAD_DEFAULT_CONFIG as DEFAULT_CONFIG } from "~/config/files";
import { formatBytes } from "~/utils/formatBytes";

const schema = z.object({
  files: z
    .instanceof(File, { message: "Please upload a file." })
    .array()
    .refine((list) => list.length > 0, "No files selected")
    .refine(
      (list) => list.length <= DEFAULT_CONFIG.maxFiles,
      `Maximum ${DEFAULT_CONFIG.maxFiles} files allowed`,
    )
    .refine(
      (list) => {
        return list.every((file) =>
          DEFAULT_CONFIG.allowedFileTypes.includes(file.type),
        );
      },
      `Invalid file type. Allowed types: ${DEFAULT_CONFIG.allowedExtensions.join(", ")}`,
    )
    .refine(
      (files) => {
        return files.every(
          (file) => file.size <= DEFAULT_CONFIG.maxSizeInBytes,
        );
      },
      {
        message: `File size can not exceed ${formatBytes(DEFAULT_CONFIG.maxSizeInBytes)}MB`,
      },
    ),
});
export type BotReply = z.infer<typeof schema>;
export const botReplyResolver = zodResolver(schema);
