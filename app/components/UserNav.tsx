import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { Logout } from "./Logout";

export interface UserNavProps {
  currentUser: UserClient | null;
}

export function UserNav({ currentUser }: UserNavProps) {
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
