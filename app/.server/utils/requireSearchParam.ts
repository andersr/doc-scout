import type { AppKeys } from "~/shared/keys";

export function requireSearchParam({
  key,
  request,
}: {
  key: AppKeys;
  request: Request;
}): string {
  const params = new URL(request.url).searchParams;
  const param = params.get(key);

  if (!param) {
    throw new Error(`Missing search param: ${key}`);
  }

  return param;
}
