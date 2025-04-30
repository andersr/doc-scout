import { Form } from "react-router";
import { twMerge } from "tailwind-merge";
import { appRoutes } from "~/shared/appRoutes";

export function Logout({}: // onClick,
// label,
{
  // onClick?: () => void;
  // label?: string;
}) {
  return (
    <Form
      method="POST"
      action={appRoutes("/logout")}
      // onSubmit={() => (onClick ? onClick() : undefined)}
    >
      <button
        type="submit"
        className={twMerge(
          "text-dark-blue font-medium hover:bg-grey-1 p-3 rounded"
          // HOVER_TRANSITION,
        )}
      >
        Sign Out
      </button>
    </Form>
  );
}
