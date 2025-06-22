import type { LoaderFunctionArgs } from "react-router";

export type ActionHandlerArgs = {
  params: LoaderFunctionArgs["params"];
  request: Request;
};

export type ActionHandlerFn = (
  args: ActionHandlerArgs & { formData: FormData },
) => Promise<Response | null>;
