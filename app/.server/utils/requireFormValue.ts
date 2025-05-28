import type { AppKeys } from "~/shared/keys";

export function requireFormValue({
  formData,
  key,
}: {
  formData: FormData;
  key: AppKeys;
}): string {
  const val = formData.get(key);

  if (!val) {
    throw new Error(`Missing form value for ${key}`);
  }

  return val.toString();
}
