import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import type { UserInternal } from "~/types/user";
import { Logout } from "./Logout";

export interface UserNavProps {
  currentUser: UserInternal | null;
}

export function UserNav({ currentUser }: UserNavProps) {
  return currentUser ? (
    <div className="flex items-center gap-4">
      {currentUser.email}
      <Logout />
    </div>
  ) : (
    <div>
      <Link to={appRoutes("/login")}>Sign In</Link>
    </div>
  );
}
