import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { APIError, type ApiResponse } from "~/types/api";

const errorData: ApiResponse = {
  data: null,
  errors: null,
  ok: false,
};

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    // TODO: return actual Zod error
    return new Response(JSON.stringify(errorData), {
      status: 400,
      statusText: "zod error",
    });
  }

  if (error instanceof APIError) {
    return new Response(JSON.stringify(errorData), {
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

  console.error("unknown error: ", error);
  return new Response(JSON.stringify(errorData), {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
}

// zod error sample
//   issues: [
//     {
//       code: 'invalid_type',
//       expected: 'string',
//       received: 'undefined',
//       path: [Array],
//       message: 'Required'
//     }
//   ],
//   addIssue: [Function (anonymous)],
//   addIssues: [Function (anonymous)],
//   errors: [
//     {
//       code: 'invalid_type',
//       expected: 'string',
//       received: 'undefined',
//       path: [Array],
//       message: 'Required'
//     }
//   ]
