import { isRouteErrorResponse } from "react-router";
import {
  DEFAULT_ERROR_MESSAGE_DETAILS,
  DEFAULT_ERROR_MESSAGE_TITLE,
} from "~/config/errors";
import type { UseErrorBoundaryOutput } from "./types";

export function useErrorBoundary(error: unknown): UseErrorBoundaryOutput {
  let message = DEFAULT_ERROR_MESSAGE_TITLE;
  let details = DEFAULT_ERROR_MESSAGE_DETAILS;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return { details, message, stack };
}
