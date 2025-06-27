import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { ZodError } from "zod";
import { ServerError, type ServerResponse } from "~/types/server";

export function serverError(error: unknown) {
  const res: ServerResponse = {
    errors: [ReasonPhrases.INTERNAL_SERVER_ERROR],
    ok: false,
  };
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let stack: string | undefined = "";

  if (error instanceof ServerError) {
    res.errors = [error.message];
    statusCode = error.statusCode;
    stack = error.stack;
  }

  if (error instanceof ZodError) {
    res.errors = error.issues.map((e) => `${e.path[0]}: ${e.message}`);
    statusCode = StatusCodes.BAD_REQUEST;
  }

  if (error instanceof Error) {
    res.errors = [`${error.name}: ${error.message}`];
    stack = error.stack;
  }

  console.error("server error: ", error);
  console.error("stack trace: ", stack);
  return data(res, statusCode);
}
