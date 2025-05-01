import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";

export function AppNav() {
  return (
    <ul>
      <li>
        <Link to={appRoutes("/")}>Home</Link>
      </li>
      <li>
        <Link to={appRoutes("/dashboard")}>Dashboard</Link>
      </li>
    </ul>
  );
}
