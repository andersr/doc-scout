import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { Icon } from "./Icon";
import { DocScoutLogo } from "./Logo";

export function AppNav() {
  return (
    <ul className="flex flex-wrap items-center gap-4">
      <li>
        <Link
          className="inline-block rounded-md border border-gray-300 p-0.5"
          to={appRoutes("/")}
        >
          <DocScoutLogo size={36} color="#cc990e" />
        </Link>
      </li>
      <li>
        <Link to={appRoutes("/docs")}>
          <Icon name="DOCUMENTS" label="documents" />
        </Link>
      </li>
      <li>
        <Link to={appRoutes("/chats")}>
          <Icon name="CHATS" label="chats" />
        </Link>
      </li>
    </ul>
  );
}
