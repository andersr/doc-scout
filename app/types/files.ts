export interface FileUploadOptions {
  allowedExtensions: string[];
  allowedFileTypes: string[];
  maxFiles: number;
  maxSizeInBytes: number;
}

export type SignedUrlPayload = {
  fileName: string;
  signedUrl: string;
  sourcePublicId: string;
};
