import { useMatches } from "react-router";
import type { RouteData } from "~/types/routeData";

export function useRouteData(): RouteData {
  const matches = useMatches();

  if (matches.length === 0) {
    return {};
  }

  return matches[matches.length - 1].handle as RouteData;
}
