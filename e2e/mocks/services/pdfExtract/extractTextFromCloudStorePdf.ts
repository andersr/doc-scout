/* eslint-disable @typescript-eslint/no-unused-vars */
import { MOCK_SOURCE } from "e2e/mocks/sources/mockSource";
import { StatusCodes } from "http-status-codes";
import { ServerError } from "~/types/server";

export async function extractTextFromCloudStorePdf(
  storagePath: string,
): Promise<string> {
  try {
    return MOCK_SOURCE.text;
  } catch (error) {
    throw new ServerError(`E2E Test error: ${error}`, StatusCodes.BAD_GATEWAY);
  }
}
