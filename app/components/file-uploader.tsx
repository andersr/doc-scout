import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  DEFAULT_ALLOWED_EXTENSIONS,
  DEFAULT_ALLOWED_FILE_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
} from "~/config/files";
import { validateFile } from "~/utils/validateFile";

interface FileUploaderProps {
  allowedExtensions?: string[];
  allowedFileTypes?: string[];
  inputName: string;
  label?: string;
  maxFiles?: number;
  maxSizeInBytes?: number;
  onFilesChange: (files: File[]) => void;
  placeholder?: string;
}

export function FileUploader({
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  inputName,
  label = "Upload Files",
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeInBytes = DEFAULT_MAX_FILE_SIZE,
  onFilesChange,
  placeholder = "Drag and drop files here, or click to select files",
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      onFilesChange([]);
      return;
    }

    // Check if too many files are selected
    if (files.length > maxFiles) {
      setFileErrors({ tooMany: `Maximum ${maxFiles} files allowed` });
      setSelectedFiles([]);
      onFilesChange([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // Validate each file
    Array.from(files).forEach((file) => {
      const error = validateFile(file, {
        allowedExtensions,
        allowedFileTypes,
        maxSizeInBytes,
      });
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
    onFilesChange(newSelectedFiles);
  };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setFileErrors({});
      onFilesChange([]);
      return;
    }

    // Check if too many files are selected
    if (files.length > maxFiles) {
      setFileErrors({ tooMany: `Maximum ${maxFiles} files allowed` });
      setSelectedFiles([]);
      onFilesChange([]);
      return;
    }

    const newSelectedFiles: File[] = [];
    const newFileErrors: { [key: string]: string } = {};

    // Validate each file
    Array.from(files).forEach((file) => {
      const error = validateFile(file, {
        allowedExtensions,
        allowedFileTypes,
        maxSizeInBytes,
      });
      if (error) {
        newFileErrors[file.name] = error;
      } else {
        newSelectedFiles.push(file);
      }
    });

    setSelectedFiles(newSelectedFiles);
    setFileErrors(newFileErrors);
    onFilesChange(newSelectedFiles);

    // Update the file input element to reflect the dropped files
    const fileInput = document.getElementById(inputName) as HTMLInputElement;
    if (fileInput && newSelectedFiles.length > 0) {
      // Create a new DataTransfer object and add our files
      const dataTransfer = new DataTransfer();
      newSelectedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }

    setIsDraggingOver(false);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    // Update the file input element to reflect the removed file
    const fileInput = document.getElementById(inputName) as HTMLInputElement;
    if (fileInput && updatedFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }
  };

  return (
    <div
      className={twMerge(
        "rounded-md border-2 border-dashed border-gray-300 p-6 text-center",
        isDraggingOver && "border-gray-500 bg-gray-100",
      )}
      // onDragOver={handleDragOver}
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
      {/* Display errors */}
      {Object.keys(fileErrors).length > 0 && (
        <div className="mt-2">
          {Object.entries(fileErrors).map(([fileName, error]) => (
            <p key={fileName} className="text-sm text-red-500">
              {fileName === "tooMany" ? error : `${fileName}: ${error}`}
            </p>
          ))}
        </div>
      )}
      {/* Display selected files */}
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
