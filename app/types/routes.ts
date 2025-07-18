import type { MenuActionInput } from "./menu";

export interface RouteData {
  actionsInput?: MenuActionInput[];
  addBackButton?: boolean;
  docUrl?: string;
  noFooter?: boolean;
  pageTitle?: string;
}

export type LayoutRouteData = Required<Pick<RouteData, "pageTitle">> &
  Pick<RouteData, "docUrl" | "addBackButton" | "actionsInput" | "noFooter"> & {
    isDocDetails?: boolean;
  };
