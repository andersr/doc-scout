/**
 * Constants for file validation
 */
export const DEFAULT_MAX_FILE_SIZE = 1048576; // 1MB
export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_ALLOWED_EXTENSIONS = [".md"];
export const DEFAULT_ALLOWED_FILE_TYPES = ["text/markdown", "text/plain"];

/**
 * Validates a file's extension
 * @param file The file to validate
 * @param allowedExtensions Array of allowed file extensions (e.g., ['.md', '.txt'])
 * @returns Error message or null if valid
 */
export function validateFileExtension(
  file: File,
  allowedExtensions: string[] = DEFAULT_ALLOWED_EXTENSIONS,
): string | null {
  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!allowedExtensions.includes(fileExtension)) {
    return `Only ${allowedExtensions.join(", ")} files are allowed`;
  }
  return null;
}

/**
 * Validates a file's MIME type
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types (e.g., ['text/markdown', 'text/plain'])
 * @returns Error message or null if valid
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = DEFAULT_ALLOWED_FILE_TYPES,
): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type`;
  }
  return null;
}

/**
 * Validates a file's size
 * @param file The file to validate
 * @param maxSizeInBytes Maximum file size in bytes
 * @returns Error message or null if valid
 */
export function validateFileSize(
  file: File,
  maxSizeInBytes: number = DEFAULT_MAX_FILE_SIZE,
): string | null {
  if (file.size > maxSizeInBytes) {
    return `File size exceeds ${maxSizeInBytes / 1024 / 1024}MB limit`;
  }
  return null;
}

/**
 * Validates a file against multiple criteria
 * @param file The file to validate
 * @param options Validation options
 * @returns Error message or null if valid
 */
export function validateFile(
  file: File,
  options: {
    maxSizeInBytes?: number;
    allowedFileTypes?: string[];
    allowedExtensions?: string[];
  } = {},
): string | null {
  const {
    maxSizeInBytes = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
    allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  } = options;

  // Check extension
  const extensionError = validateFileExtension(file, allowedExtensions);
  if (extensionError) return extensionError;

  // Check MIME type
  const typeError = validateFileType(file, allowedFileTypes);
  if (typeError) return typeError;

  // Check size
  const sizeError = validateFileSize(file, maxSizeInBytes);
  if (sizeError) return sizeError;

  return null;
}

/**
 * Validates a collection of files
 * @param files The files to validate
 * @param options Validation options
 * @returns Object with errors by filename, or empty object if all valid
 */
export function validateFiles(
  files: File[],
  options: {
    maxFiles?: number;
    maxSizeInBytes?: number;
    allowedFileTypes?: string[];
    allowedExtensions?: string[];
  } = {},
): { [key: string]: string } {
  const {
    maxFiles = DEFAULT_MAX_FILES,
    maxSizeInBytes = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
    allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  } = options;

  const errors: { [key: string]: string } = {};

  // Check if too many files
  if (files.length > maxFiles) {
    errors.tooMany = `Maximum ${maxFiles} files allowed`;
    return errors;
  }

  // Validate each file
  files.forEach((file) => {
    const error = validateFile(file, {
      maxSizeInBytes,
      allowedFileTypes,
      allowedExtensions,
    });
    if (error) {
      errors[file.name] = error;
    }
  });

  return errors;
}
