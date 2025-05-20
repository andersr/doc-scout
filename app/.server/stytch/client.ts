import stytch from "stytch";
import { ENV } from "../ENV";

export const stytchClient = new stytch.Client({
  project_id: ENV.STYTCH_PROJECT_ID,
  secret: ENV.STYTCH_SECRET,
});

export const STYTCH_SESSION_TOKEN = "stytch_session_token";
