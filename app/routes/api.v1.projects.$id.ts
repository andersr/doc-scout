import { data } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireProjectViaKey } from "~/.server/projects/requireProjectViaKey";
import { type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader(args: Route.LoaderArgs) {
  try {
    const project = await requireProjectViaKey(args);

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      errors: null,
      ok: true,
      data: project,
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}
