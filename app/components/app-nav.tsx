import { Link } from "react-router";
import { POMPADOUR_PURPLE } from "~/config/theme";
import { appRoutes } from "~/shared/appRoutes";
import { FoldedDoc } from "./brand/FoldedDoc";
import { Icon } from "./icon";

export function AppNav() {
  return (
    <ul className="flex flex-wrap items-center gap-4">
      <li>
        <Link
          className="text-pompadour/70 flex items-center"
          to={appRoutes("/")}
        >
          <FoldedDoc size={24} color={POMPADOUR_PURPLE} />{" "}
          <div className="pl-2 text-3xl font-stretch-50%">Doc Scout</div>
        </Link>
      </li>
      <li>
        <Link to={appRoutes("/docs")}>
          <Icon name="DOCUMENTS" fontSize="30px" label="documents" />
        </Link>
      </li>
      <li>
        <Link to={appRoutes("/chats")}>
          <Icon name="CHATS" fontSize="30px" label="chats" />
        </Link>
      </li>
    </ul>
  );
}
