import { data } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireProjectViaKey } from "~/.server/projects/requireProjectViaKey";
import { type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader(args: Route.LoaderArgs) {
  try {
    const projectClient = await requireProjectViaKey(args);

    return data<ApiResponse>({
      data: projectClient,
      errorMessage: "",
      errors: null,
      ok: true,
      successMessage: "This worked",
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}
