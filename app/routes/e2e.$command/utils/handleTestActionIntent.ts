import { StatusCodes } from "http-status-codes";
import type { LoaderFunctionArgs } from "react-router";
import type { ActionHandlerFn } from "~/types/action";
import { ServerError } from "~/types/server";
import { TEST_KEYS, TestKeys } from "../../../__test__/keys";

export type ActionHandlers = { [k in TestKeys]?: ActionHandlerFn };

export async function handleTestActionIntent({
  handlers,
  params,
  request,
}: {
  handlers: ActionHandlers;
  params: LoaderFunctionArgs["params"];
  request: Request;
}) {
  try {
    const command = params[TEST_KEYS.command];

    if (!command) {
      throw new Error(`Missing command`);
    }

    if (!isAppKey(command)) {
      throw new ServerError(
        `Unknown command: ${command}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (!(command in handlers) || !handlers[command]) {
      throw new ServerError(
        `No matching handler found for command: ${command}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    const clone = request.clone();
    const formData = await clone.formData();

    return await handlers[command]({ formData, request });
  } catch (error) {
    console.error("error: ", error);
  }
}

function isAppKey(str: string): str is TestKeys {
  return TestKeys.includes(str as TestKeys);
}
