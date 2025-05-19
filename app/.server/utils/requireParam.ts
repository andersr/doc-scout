import type { LoaderFunctionArgs } from "react-router";

export function requireParam({
  key,
  params,
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
