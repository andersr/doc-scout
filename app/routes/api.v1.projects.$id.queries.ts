import { data } from "react-router";
import { requireProject } from "~/.server/projects/requireProject";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { APIError, type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const project = await requireProject({ request, params });

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      ok: true,
      data: project,
    });
  } catch (error: unknown) {
    console.error("api error: ", error);
    return data<ApiResponse>(
      {
        errorMessage:
          (error as APIError).message ?? INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        ok: false,
        data: null,
      },
      (error as APIError).statusCode ?? 500,
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const project = await requireProject({ request, params });

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      ok: true,
      data: project,
    });
  } catch (error: unknown) {
    console.error("api error: ", error);
    return data<ApiResponse>(
      {
        errorMessage:
          (error as APIError).message ?? INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        ok: false,
        data: null,
      },
      (error as APIError).statusCode ?? 500,
    );
  }
}
