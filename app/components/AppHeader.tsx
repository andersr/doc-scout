import { Link } from "react-router";

import { FoldedDoc } from "~/components/brand/FoldedDoc";
import { POMPADOUR_PURPLE } from "~/config/theme";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";

interface Props {
  user?: UserClient;
}

export default function AppHeader({ user }: Props) {
  return (
    <header className="flex items-center gap-2">
      <div className="flex-1">
        <Link
          className="text-pompadour/70 flex items-center"
          to={appRoutes("/")}
        >
          <FoldedDoc size={24} color={POMPADOUR_PURPLE} />
          <div className="pl-2 text-3xl font-stretch-50%">Doc Scout</div>
        </Link>
      </div>
      {/* <div className="flex items-center gap-4">
        <Link className="flex items-center" to={appRoutes("/docs")}>
          <Icon
            name="DOCUMENTS"
            fontSize="34px"
            customStyles="text-stone-500"
            label="documents"
          />
        </Link>
        <Link className="flex items-center" to={appRoutes("/chats")}>
          <Icon
            name="CHATS"
            fontSize="34px"
            customStyles="text-stone-500"
            label="chats"
          />
        </Link>
        {user ? (
          <div className="flex items-center gap-2">
            <div>
              <Avatar email={user.email} />
            </div>
          </div>
        ) : (
          <div>
            <Link to={appRoutes("/login")}>Sign In</Link>
          </div>
        )}
      </div> */}
    </header>
  );
}
