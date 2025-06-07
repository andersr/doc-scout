import { appRoutes } from "~/shared/appRoutes";

export const APP_NAMESPACE = "research_tool";
export const AUTH_SESSION_NAME = `${APP_NAMESPACE}_auth`;
export const STYTCH_SESSION_DURATION_MINUTES = 60 * 24 * 7 * 2; // 14 days
export const AUTH_SESSION_DURATION = 60 * STYTCH_SESSION_DURATION_MINUTES;
export const STYTCH_SESSION_TOKEN = "stytch_session_token";
export const AUTH_USER_KEY = `${AUTH_SESSION_NAME}_user`;
export const AUTH_DEFAULT_REDIRECT = appRoutes("/");
export const ID_SECRET_DIVIDER = "|";
export const API_KEY_HEADER = "x-api-key";
