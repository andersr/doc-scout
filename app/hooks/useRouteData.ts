import { useMatches } from "react-router";
import { $routeId as routeId } from "safe-routes";
import type { LayoutRouteData, RouteData } from "~/types/routes";

export function useRouteData(): LayoutRouteData {
  const matches = useMatches();

  if (matches.length === 0) {
    return {
      addBackButton: false,
      docUrl: "",
      isDocDetails: false,
      pageTitle: "",
    };
  }

  const leafRouteMatches = matches[matches.length - 1];
  const id = leafRouteMatches.id;
  const data = leafRouteMatches.data as RouteData;
  const handle = leafRouteMatches.handle as RouteData;
  const isDocDetails = id === routeId("routes/_auth.docs.$id");

  return {
    actionsInput: data?.actionsInput,
    addBackButton: handle.addBackButton ?? false,
    docUrl: data?.docUrl ? data.docUrl : "",
    isDocDetails,
    noFooter: handle.noFooter ?? false,
    pageTitle: data?.pageTitle ?? handle.pageTitle ?? "",
  };
}
