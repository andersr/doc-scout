import { Link, useLocation } from "react-router";

import { appRoutes } from "~/shared/appRoutes";
import { Logo } from "../brand/Logo";

export interface AppHeaderProps {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
}

export default function AppHeader({ leftNav, rightNav }: AppHeaderProps) {
  const { pathname } = useLocation();

  const isHome = pathname === appRoutes("/");

  return (
    <header className="flex h-12 items-center gap-2 md:gap-4">
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        {isHome ? (
          <div className="inline-block">
            <Logo />
          </div>
        ) : (
          <Link to={appRoutes("/")} className="inline-block">
            <Logo />
          </Link>
        )}
        {leftNav}
      </div>

      {rightNav}
    </header>
  );
}
