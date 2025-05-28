import { StatusCodes } from "http-status-codes";
import { AppKeys, KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import { requireFormValue } from "../utils/requireFormValue";
import { serverError } from "../utils/serverError";

function isAppKey(str: string): str is AppKeys {
  return AppKeys.includes(str as AppKeys);
}

export type ActionHandler = ({
  formData,
  request,
}: {
  formData: FormData;
  request: Request;
}) => Promise<Response | null>;

export type ActionHandlers = { [k in AppKeys]?: ActionHandler };

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
