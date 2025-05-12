import type { ActionData } from "~/types/actionData";
import { getTOTP } from "../utils/getTotp";

export const actionHandlers: Record<string, () => Promise<ActionData>> = {
  login: async () => {
    const { otp, verificationConfig } = await getTOTP();
    return {
      ok: true,
      data: otp,
    };
  },
};
