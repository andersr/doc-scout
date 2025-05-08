import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { requireApiKey } from "~/.server/auth/requireApiKey";
import { requireParam } from "~/.server/utils/requireParam";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { APIError, type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

// next: enable adding q param and get response
export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const id = requireParam({ key: "id", params });

    const project = await requireApiKey({ request });

    if (id !== project?.publicId) {
      throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
    }

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
