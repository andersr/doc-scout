import { Link, useLocation } from "react-router";

import { appRoutes } from "~/shared/appRoutes";
import { LogoWithText } from "../brand/LogoWithText";

export default function AppHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { pathname } = useLocation();

  const isHome = pathname === appRoutes("/");

  return (
    <header className="flex items-center gap-2 md:gap-4">
      <div className="flex-1">
        {isHome ? (
          <LogoWithText />
        ) : (
          <Link to={appRoutes("/")} className="inline-block">
            <LogoWithText />
          </Link>
        )}
      </div>
      {children}
    </header>
  );
}
