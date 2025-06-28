import { type FileRejection, useDropzone } from "react-dropzone";
import {
  displaySupportedFormats,
  DROPZONE_ID,
  FILE_CONFIG,
  FILETYPES_ACCEPTED,
} from "~/config/files";
import { LG_ICON_SIZE } from "~/config/icons";
import { cn } from "~/lib/utils";
import { Icon } from "../ui/Icon";

export function Dropzone({
  onDrop,
}: {
  onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: FILETYPES_ACCEPTED,
    maxFiles: FILE_CONFIG.maxFiles,
    multiple: true,
    onDrop,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out",
          "bg-background/50 p-8 text-center",
          "hover:bg-accent/50 hover:border-accent-foreground/50",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          isDragActive ? "border-black bg-white" : "border-gray-400",
        )}
        role="button"
        tabIndex={0}
        id={DROPZONE_ID}
        aria-label="File upload area"
      >
        <input {...getInputProps()} aria-describedby="dropzone-description" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon
              name="UPLOAD_FILE"
              fontSize={LG_ICON_SIZE}
              label="Upload files"
            />
          </div>

          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-primary text-lg font-medium">
                Drop files here
              </p>
            ) : (
              <p className="text-lg font-medium">
                <span className="hidden md:block">
                  Drag and drop files here, or click to browse files
                </span>
                <span className="md:hidden">Click/tap to browse files</span>
              </p>
            )}
          </div>

          <div
            className="text-muted-foreground text-xs"
            id="dropzone-description"
          >
            Supported formats: {displaySupportedFormats}
          </div>
          <div
            className="text-muted-foreground text-xs"
            id="dropzone-description"
          >
            Max file size: {FILE_CONFIG.maxSizeInBytes / (1024 * 1024)}MB
          </div>
        </div>
      </div>
    </div>
  );
}
