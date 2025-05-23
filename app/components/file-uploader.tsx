import { twMerge } from "tailwind-merge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface FileUploaderProps {
  allowedExtensions: string[];
  fileErrors: { [key: string]: string };
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputName: string;
  isDraggingOver: boolean;
  label?: string;
  maxFiles: number;
  maxSizeInBytes: number;
  placeholder?: string;
  removeFile: (fileName: string) => void;
  selectedFiles: File[];
  setIsDraggingOver: (isDragging: boolean) => void;
}

export function FileUploader({
  allowedExtensions,
  fileErrors,
  handleDrop,
  handleFileChange,
  inputName,
  isDraggingOver,
  label = "Upload Files",
  maxFiles,
  maxSizeInBytes,
  placeholder = "Drag and drop files here, or click to select files",
  removeFile,
  selectedFiles,
  setIsDraggingOver,
}: FileUploaderProps) {
  return (
    <div
      className={twMerge(
        "rounded-md border-2 border-dashed border-gray-300 p-6 text-center",
        isDraggingOver && "border-gray-500 bg-gray-100",
      )}
      onDragEnter={() => setIsDraggingOver(true)}
      onDragLeave={() => setIsDraggingOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Label className="pointer-events-none" htmlFor={inputName}>
        {label}
      </Label>
      <Input
        id={inputName}
        name={inputName}
        type="file"
        accept={allowedExtensions.join(",")}
        multiple
        onChange={handleFileChange}
        className="pointer-events-none mt-2"
      />
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
                  className="text-sm text-red-500 hover:text-red-700"
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
