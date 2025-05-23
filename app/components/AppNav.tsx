import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";

export function AppNav() {
  return (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Link to={appRoutes("/")}>DocScout Logo</Link>
      </li>
      <li>
        <Link to={appRoutes("/docs")}>Docs</Link>
      </li>
      <li>
        <Link to={appRoutes("/chats")}>Chats</Link>
      </li>
    </ul>
  );
}
