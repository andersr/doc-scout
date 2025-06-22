import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";

export const loader = async () => {
  if (!process.env.E2E_ENV) {
    throw data({ error: ReasonPhrases.FORBIDDEN }, StatusCodes.FORBIDDEN);
  }
  return null;
};
