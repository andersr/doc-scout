import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { Logout } from "./Logout";

export function UserNav({ currentUser }: { currentUser: UserClient | null }) {
  return currentUser ? (
    <div>
      User: {currentUser.email}, <Logout />
    </div>
  ) : (
    <div>
      <Link to={appRoutes("/login")}>Sign In</Link>
    </div>
  );
}
