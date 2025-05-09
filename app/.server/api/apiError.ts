import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { APIError, type ApiResponse } from "~/types/api";

export function apiError(error: unknown) {
  return data<ApiResponse>(
    {
      errorMessage:
        error instanceof APIError
          ? error.message
          : ReasonPhrases.INTERNAL_SERVER_ERROR,
      ok: false,
      data: null,
    },
    error instanceof APIError
      ? error.statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR,
  );
}
