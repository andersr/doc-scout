/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { ServerError } from "~/types/server";
import { MOCK_SOURCE } from "../../sources/mockSource";

export async function extractTextFromCloudStorePdf(
  storagePath: string,
): Promise<string> {
  try {
    return MOCK_SOURCE.text;
  } catch (error) {
    throw new ServerError(`E2E Test error: ${error}`, StatusCodes.BAD_GATEWAY);
  }
}
