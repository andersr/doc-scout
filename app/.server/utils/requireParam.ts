import type { LoaderFunctionArgs } from "react-router";

// TODO: rename to requireRouteParam
export function requireParam({
  params,
  key,
}: {
  key: string;
  params: LoaderFunctionArgs["params"];
}): string {
  const param = params[key];

  if (!param) {
    throw new Error(`Missing param: ${key}`);
  }

  return param;
}
