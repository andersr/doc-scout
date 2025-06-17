import { StatusCodes } from "http-status-codes";
import { AppKeys, KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "~/types/action";
import { ServerError } from "~/types/server";
import { isAppKey } from "./isAppKey";
import { requireFormValue } from "./requireFormValue";
import { serverError } from "./serverError";

export type ActionHandlers = { [k in AppKeys]?: ActionHandlerFn };

export async function handleActionIntent({
  handlers,
  request,
}: {
  handlers: ActionHandlers;
  request: Request;
}) {
  try {
    const clone = request.clone();
    const formData = await clone.formData();
    const intent = requireFormValue({ formData, key: KEYS.intent });

    // TODO: needs to be tested
    if (!isAppKey(intent)) {
      throw new ServerError(
        `Unknown intent: ${intent}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    if (!(intent in handlers) || !handlers[intent]) {
      throw new ServerError(
        `No matching handler found for intent: ${intent}`,
        StatusCodes.BAD_REQUEST,
      );
    }

    return await handlers[intent]({ formData, request: clone });
  } catch (error) {
    return serverError(error);
  }
}
