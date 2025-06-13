import stytch from "stytch";
import { ENV } from "~/.server/ENV";

export const stytchClient = new stytch.Client({
  project_id: ENV.STYTCH_PROJECT_ID,
  secret: ENV.STYTCH_SECRET,
});
