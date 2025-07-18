import { useLocation } from "react-router";
import { appRoutes } from "~/shared/appRoutes";

export function useIsRoute() {
  const { pathname } = useLocation();

  return {
    isHome: pathname === appRoutes("/"),
  };
}
