import { ENV } from "../ENV";

export function isAllowedUser(email: string) {
  const envVar = ENV.ALLOWED_USERS;
  if (envVar === "any") {
    return true;
  }

  const allowedUsers = envVar.split(",");

  return allowedUsers.includes(email);
}
