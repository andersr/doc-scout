// export interface FormDataEntryValueCollection {
//   [k: string]: FormDataEntryValue;
// }
// formPayload: FormDataEntryValueCollection
// interface ActionHandlerCollection {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: () => Promise<any>;
// }

import type { ActionData } from "~/types/actionData";

// export interface ActionResponse {
//   ok: boolean;
//   errorMessage: string;
// }

export async function handleActionIntent({
  request,
  handlers,
}: {
  request: Request;
  handlers: Record<string, () => Promise<ActionData>>;
}): Promise<ActionData> {
  const formPayload = Object.fromEntries(await request.formData());
  // console.log("formPayload: ", formPayload);
  const intent = formPayload["intent"]?.toString();

  if (!intent) {
    throw new Error("No intent found");
  }
  // console.log("intent: ", intent);

  if (handlers[intent]) {
    return await handlers[intent]();
  }

  throw new Error(`No matching handler found for intent: ${intent}`);
}

// export async function handleActionIntent({
//   intent,
//   request,
//   handlers,
//   //   intentParam,
// }: {
//   intent: string;
//   request: Request;
//   handlers: Record<
//     string,
//     () => Promise<{ ok: boolean; errorMessage: string; email?: string }>
//   >;
//   //   intentParam?: string;
// }) {
//   //   const intent = intentParam;
//   //   const clone = request.clone();
//   //   const formPayload = Object.fromEntries(await clone.formData());
//   //   const intentParam = formPayload[PARAMS.INTENT];
//   //   const intent = intentParam?.toString();
//   //   console.log("intent: ", intent);
//   //   console.log("keys: ", Object.keys(handlers));
//   //   console.log("handlers: ", handlers);

//   try {
//     console.log("handlers: ", handlers);
//     if (!intent) {
//       throw new Error("No intent found");
//     }
//     if (typeof intent !== "string") {
//       throw new Error("Not a string");
//     }
//     console.log("intent: ", intent);

//     const handler = handlers[intent];
//     console.log("handler: ", handler);
//     if (handler) {
//       return await handler();
//     }
// throw new Error(`No matching handler found for intent: ${"login"}`);
//   } catch (error) {
//     console.log("handleActionIntent error: ", error);
//     // return null; // for now
//     return {
//       email: "",
//       errorMessage: "",
//       ok: true,
//     };
//   }
// }
