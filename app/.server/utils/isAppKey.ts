import { AppKeys } from "~/shared/keys";

export function isAppKey(str: string): str is AppKeys {
  return AppKeys.includes(str as AppKeys);
}
