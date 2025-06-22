import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { ZodError } from "zod";
import { ServerError, type ServerResponse } from "~/types/server";

// TODO: NEEDS TO BE TESTED
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
    // TODO: return actual Zod error
    return new Response(JSON.stringify(error), {
      status: 400,
      statusText: "zod error",
    });
  }

  if (error instanceof Error) {
    // TODO: return actual Zod error
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
