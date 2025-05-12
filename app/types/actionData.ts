// TODO: separate out url, s3Key, do not belong here
export interface ActionData {
  url?: string;
  errorMessage?: string;
  successMessage?: string;
  ok: boolean;
  s3Key?: string;
  data?: unknown;
}
