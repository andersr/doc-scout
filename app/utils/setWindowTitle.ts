import { APP_NAME } from "~/config/app";

export function setWindowTitle(pageTitle: string) {
  return pageTitle ? `${pageTitle} - ${APP_NAME}` : APP_NAME;
}
