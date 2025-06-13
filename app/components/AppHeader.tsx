import { Link } from "react-router";

import { Logo } from "~/components/brand/Logo";
import { appRoutes } from "~/shared/appRoutes";

export default function AppHeader() {
  return (
    <header className="flex items-center gap-2">
      <div className="flex-1">
        <Link
          className="text-pompadour/70 flex items-center"
          to={appRoutes("/")}
        >
          <Logo size={24} />
          <div className="pl-2 text-3xl font-stretch-50%">Doc Scout</div>
        </Link>
      </div>
    </header>
  );
}
