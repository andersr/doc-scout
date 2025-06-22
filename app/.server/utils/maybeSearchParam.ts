import type { AppKeys } from "~/shared/keys";

export function maybeSearchParam({
  key,
  request,
}: {
  key: AppKeys;
  request: Request;
}): string | null {
  const params = new URL(request.url).searchParams;
  const param = params.get(key);

  return param;
}
