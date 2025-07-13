import { useLocation } from "react-router";

import { appRoutes } from "~/shared/appRoutes";
import { LogoWithText } from "../brand/LogoWithText";
import ConditionalLink from "../ui/ConditionalLink";

export interface AppHeaderProps {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
}

export default function AppHeader({ leftNav, rightNav }: AppHeaderProps) {
  const { pathname } = useLocation();

  const isHome = pathname === appRoutes("/");

  return (
    <header className="relative flex items-center gap-2 md:gap-4">
      <div className="absolute top-0.5 left-0 flex h-12 items-center md:top-0">
        <ConditionalLink
          to={appRoutes("/")}
          shouldLink={isHome}
          label={<LogoWithText />}
        />
      </div>
      <div className="ml-[110px] flex h-12 flex-1 items-center md:ml-[160px] md:gap-6">
        {leftNav}
      </div>
      {rightNav}
    </header>
  );
}
