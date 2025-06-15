import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
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

  // TODO: re-add Zod eror handling
  // if (error instanceof ZodError) {
  //   // TODO: return actual Zod error
  //   return new Response(JSON.stringify(DEFAULT_ERROR), {
  //     status: 400,
  //     statusText: "zod error",
  //   });
  // }

  // if (error instanceof APIError) {
  //   return new Response(JSON.stringify(DEFAULT_ERROR), {
  //     status:
  //       error instanceof APIError
  //         ? error.statusCode
  //         : StatusCodes.INTERNAL_SERVER_ERROR,
  //     statusText:
  //       error instanceof APIError
  //         ? error.message
  //         : ReasonPhrases.INTERNAL_SERVER_ERROR,
  //   });
  // }

  // TODO: also handle instanceOf Error

  console.error("unknown error: ", error);
  return data(
    {
      errors: [ReasonPhrases.INTERNAL_SERVER_ERROR],
      ok: false,
    } satisfies ServerResponse,
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
}
