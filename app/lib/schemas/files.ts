import { z } from "zod";
import { FILE_CONFIG as CONFIG } from "~/config/files";
import { formatBytes } from "~/utils/formatBytes";

export const fileNameSchema = z
  .string()
  .min(5)
  .refine((name) => name.trim() !== "", {
    message: `File name cannot be empty`,
  });

export const fileNameListSchema = z
  .array(fileNameSchema)
  .refine((list) => list.length > 0, "No files selected")
  .refine(
    (list) => list.length <= CONFIG.maxFiles,
    `Maximum ${CONFIG.maxFiles} files allowed`,
  );

export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.name.trim() !== "", {
    message: `File name cannot be empty`,
  })
  .refine((file) => CONFIG.allowedFileTypes.includes(file.type), {
    message: `Invalid file type. Allowed types: ${CONFIG.allowedExtensions.join(", ")}`,
  })
  .refine((file) => file.size <= CONFIG.maxSizeInBytes, {
    message: `File size can not exceed ${formatBytes(CONFIG.maxSizeInBytes)}MB`,
  });

export const fileListSchema = z
  .array(fileSchema)
  .refine((list) => list.length > 0, "No files selected")
  .refine(
    (list) => list.length <= CONFIG.maxFiles,
    `Maximum ${CONFIG.maxFiles} files allowed`,
  );

export const sourceIdListSchema = z
  .array(z.string().min(5))
  .refine((list) => list.length > 0, "No items");
