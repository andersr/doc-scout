import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { ZodError } from "zod";
import { ServerError, type ServerResponse } from "~/types/server";

export function serverError(error: unknown) {
  if (error instanceof ServerError) {
    return data(
      {
        errors: [error.message],
        ok: false,
      } satisfies ServerResponse,
      error.statusCode,
    );
  }

  if (error instanceof ZodError) {
    return data(
      {
        errors: error.issues.map((e) => `${e.path[0]}: ${e.message}`),
        ok: false,
      } satisfies ServerResponse,
      StatusCodes.BAD_REQUEST,
    );
  }

  if (error instanceof Error) {
    return new Response(JSON.stringify(error.stack), {
      status: 500,
      statusText: error.message,
    });
  }

  console.error("unknown error: ", JSON.stringify(error));
  return data(
    {
      errors: [ReasonPhrases.INTERNAL_SERVER_ERROR],
      ok: false,
    } satisfies ServerResponse,
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
}
