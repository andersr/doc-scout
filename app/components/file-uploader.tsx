import { twMerge } from "tailwind-merge";
import { Label } from "~/components/ui/label";

interface FileUploaderProps {
  allowedExtensions: string[];
  fileErrors: { [key: string]: string };
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  inputId: string;
  isDragAccept: boolean;
  isDragActive: boolean;
  isDragReject: boolean;
  label?: string;
  maxFiles: number;
  maxSizeInBytes: number;
  placeholder?: string;
  removeFile: (fileName: string) => void;
  selectedFiles: File[];
}

export function FileUploader({
  allowedExtensions,
  fileErrors,
  getInputProps,
  getRootProps,
  inputId,
  isDragAccept,
  isDragActive,
  isDragReject,
  label = "Upload Files",
  maxFiles,
  maxSizeInBytes,
  placeholder = "Drag and drop files here, or click to select files",
  removeFile,
  selectedFiles,
}: FileUploaderProps) {
  return (
    <div
      {...getRootProps()}
      className={twMerge(
        "cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
        isDragActive && "border-gray-500 bg-gray-100",
        isDragAccept && "border-green-500 bg-green-50",
        isDragReject && "border-red-500 bg-red-50",
      )}
    >
      <Label className="pointer-events-none" htmlFor={inputId}>
        {label}
      </Label>
      <input {...getInputProps()} id={inputId} />
      <p className="pointer-events-none mt-2 text-sm text-gray-500">
        {placeholder}
      </p>
      <p className="pointer-events-none mt-1 text-xs text-gray-400">
        Only {allowedExtensions.join(", ")} files up to{" "}
        {maxSizeInBytes / 1024 / 1024}MB are allowed (max {maxFiles} files)
      </p>
      {Object.keys(fileErrors).length > 0 && (
        <div className="mt-2">
          {Object.entries(fileErrors).map(([fileName, error]) => (
            <p key={fileName} className="text-sm text-red-500">
              {fileName === "tooMany" ? error : `${fileName}: ${error}`}
            </p>
          ))}
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="mt-4 text-left">
          <h3 className="mb-2 font-medium">Selected Files:</h3>
          <ul className="space-y-1">
            {selectedFiles.map((file) => (
              <li key={file.name} className="flex items-center justify-between">
                <span className="text-sm">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="cursor-pointer text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
