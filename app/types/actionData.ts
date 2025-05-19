// TODO: separate out url, s3Key, do not belong here
export type ActionData = {
  errorMessage?: string;
  ok: boolean;
  s3Key?: string;
  successMessage?: string;
  url?: string;
};
