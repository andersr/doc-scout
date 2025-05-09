import { data } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireProject } from "~/.server/projects/requireProject";
import { type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const project = await requireProject({ request, params });

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
