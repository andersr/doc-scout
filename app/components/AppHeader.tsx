import { Link } from "react-router";

import { FoldedDoc } from "~/components/brand/FoldedDoc";
import { appRoutes } from "~/shared/appRoutes";

// interface Props {
//   user?: UserClient;
// }

export default function AppHeader() {
  return (
    <header className="flex items-center gap-2">
      <div className="flex-1">
        <Link
          className="text-pompadour/70 flex items-center"
          to={appRoutes("/")}
        >
          <FoldedDoc size={24} />
          <div className="pl-2 text-3xl font-stretch-50%">Doc Scout</div>
        </Link>
      </div>
    </header>
  );
}
