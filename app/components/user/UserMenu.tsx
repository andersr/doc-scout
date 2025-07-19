import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { DropdownMenu } from "../ui/DropdownMenu";
import { Avatar } from "./Avatar";
import { LogoutBtn } from "./LogoutBtn";

export function UserMenu({ user }: { user: UserClient | null }) {
  return (
    <>
      {user ? (
        <DropdownMenu
          items={[
            <div className="truncate p-2" key={user.email}>
              {user.email}
            </div>,
            <LogoutBtn key="logout" />,
          ]}
        >
          <Avatar email={user.email} />
        </DropdownMenu>
      ) : (
        <div className="pr-1 md:text-lg">
          <Link to={appRoutes("/login")}>Sign In</Link>
        </div>
      )}
    </>
  );
}
