import { Form } from "react-router";
import { twMerge } from "tailwind-merge";
import { appRoutes } from "~/shared/appRoutes";
import { Icon } from "../icon";

export function Logout() {
  return (
    <Form method="POST" action={appRoutes("/logout")} className="inline">
      <button
        type="submit"
        className={twMerge("cursor-pointer")}
        aria-label="Sign Out"
      >
        <Icon name="LOGOUT" />
      </button>
    </Form>
  );
}
