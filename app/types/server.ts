import { getReasonPhrase, StatusCodes } from "http-status-codes";

export class ServerError extends Error {
  statusCode: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
    this.message = statusCode
      ? `${getReasonPhrase(statusCode)} (${statusCode}): ${message}`
      : message;
  }
}
