export interface FileUploadOptions {
  allowedExtensions: string[];
  allowedFileTypes: string[];
  maxFiles: number;
  maxSizeInBytes: number;
}

export interface SignedUrlResponseFileInfo {
  fileName: string;
  signedUrl: string;
  sourcePublicId: string;
  storagePath: string;
}

export interface SignedUrlResponse {
  filesInfo: SignedUrlResponseFileInfo[];
}

type SourceInitFileInfo = {
  fileName: string;
  signedUrl: string;
  sourcePublicId: string;
};

export type SourceInitResponse = {
  filesInfo: SourceInitFileInfo[];
};
