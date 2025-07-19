import { Form } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { MenuButton } from "../ui/buttons/MenuButton";

export function LogoutBtn() {
  return (
    <Form
      method="POST"
      action={appRoutes("/logout")}
      className="flex-block items-center"
    >
      <MenuButton label={"Sign Out"} type="submit" />
    </Form>
  );
}
