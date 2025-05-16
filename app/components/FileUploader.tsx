import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export interface FileUploaderProps {
  maxFiles?: number;
  maxSizeInBytes?: number;
  allowedFileTypes?: string[];
  allowedExtensions?: string[];
  onFilesChange: (files: File[]) => void;
  inputName: string;
  label?: string;
  placeholder?: string;
}

export function FileUploader({
  maxFiles = 10,
  maxSizeInBytes = 1048576, // 1MB default
  allowedFileTypes = ["text/markdown", "text/plain"],
  allowedExtensions = [".md"],
  onFilesChange,
  inputName,
  label = "Upload Files",
  placeholder = "Drag and drop files here, or click to select files",
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  const validateFile = (file: File): string | null => {
    // Check file extension
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExtension)) {
      return `Only ${allowedExtensions.join(", ")} files are allowed`;
    }

    // Check MIME type
    if (!allowedFileTypes.includes(file.type)) {
      return `Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed`;
    }

    // Check file size
    if (file.size > maxSizeInBytes) {
      return `File size exceeds ${maxSizeInBytes / 1024 / 1024}MB limit`;
    }

    return null;
  };

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
      const error = validateFile(file);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

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
      const error = validateFile(file);
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
      className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Label htmlFor={inputName}>{label}</Label>
      <Input
        id={inputName}
        name={inputName}
        type="file"
        accept={allowedExtensions.join(",")}
        multiple
        onChange={handleFileChange}
        className="mt-2"
      />
      <p className="text-sm text-gray-500 mt-2">{placeholder}</p>
      <p className="text-xs text-gray-400 mt-1">
        Only {allowedExtensions.join(", ")} files up to{" "}
        {maxSizeInBytes / 1024 / 1024}MB are allowed (maximum {maxFiles} files)
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
          <h3 className="font-medium mb-2">Selected Files:</h3>
          <ul className="space-y-1">
            {selectedFiles.map((file) => (
              <li key={file.name} className="flex items-center justify-between">
                <span className="text-sm">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="text-red-500 text-sm hover:text-red-700"
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
