export interface FileUploadOptions {
  allowedExtensions: string[];
  allowedFileTypes: string[];
  maxFiles: number;
  maxSizeInBytes: number;
}

export type SourceInitResponse = {
  fileName: string;
  signedUrl: string;
  sourcePublicId: string;
};
