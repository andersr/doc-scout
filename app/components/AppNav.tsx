import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";

export function AppNav() {
  return (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Link to={appRoutes("/")}>Home</Link>
      </li>
    </ul>
  );
}
