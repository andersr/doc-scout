import { GoSignOut } from "react-icons/go";
import { Form } from "react-router";
import { twMerge } from "tailwind-merge";
import { appRoutes } from "~/shared/appRoutes";

export function Logout() {
  return (
    <Form method="POST" action={appRoutes("/logout")} className="inline">
      <button type="submit" className={twMerge("")} aria-label="Sign Out">
        <GoSignOut className="text-xl" />
      </button>
    </Form>
  );
}
