import type { LoaderFunctionArgs } from "react-router";
import type { AppKeys } from "~/shared/keys";

export function requireRouteParam({
  key,
  params,
}: {
  key: AppKeys;
  params: LoaderFunctionArgs["params"];
}): string {
  const param = params[key];

  if (!param) {
    throw new Error(`Missing param: ${key}`);
  }

  return param;
}
