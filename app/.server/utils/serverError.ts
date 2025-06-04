import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { APIError } from "~/types/api";
import { ServerError, type ServerResponse } from "~/types/server";

const DEFAULT_ERROR: ServerResponse = {
  errors: [],
  ok: false,
};

// TODO: NEEDS TO BE TESTED
export function serverError(error: unknown) {
  if (error instanceof ServerError) {
    return new Response(JSON.stringify(error), {
      status: error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
      statusText: error.message,
    });
  }

  if (error instanceof ZodError) {
    // TODO: return actual Zod error
    return new Response(JSON.stringify(DEFAULT_ERROR), {
      status: 400,
      statusText: "zod error",
    });
  }

  if (error instanceof APIError) {
    return new Response(JSON.stringify(DEFAULT_ERROR), {
      status:
        error instanceof APIError
          ? error.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR,
      statusText:
        error instanceof APIError
          ? error.message
          : ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }

  // TODO: also return error instanceOf Error

  console.error("unknown error: ", error);
  return new Response(JSON.stringify(DEFAULT_ERROR), {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
}
