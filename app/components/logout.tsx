import { Form } from "react-router";
import { twMerge } from "tailwind-merge";
import { appRoutes } from "~/shared/appRoutes";

export function Logout() {
  return (
    <Form
      method="POST"
      action={appRoutes("/logout")}
      className="flex-block items-center"
    >
      <button
        type="submit"
        className={twMerge(
          "cursor-pointer",
          "flex w-full items-center",
          "hover:bg-stone-100",
          "transition-all duration-200 ease-in-out",
        )}
        aria-label="Sign Out"
      >
        Sign Out
      </button>
    </Form>
  );
}
