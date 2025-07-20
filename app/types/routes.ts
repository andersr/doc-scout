import type { MenuActionInput } from "./menu";

export interface RouteData {
  actionsInput?: MenuActionInput[];
  addBackButton?: boolean;
  centeredPageTitle?: boolean;
  docUrl?: string;
  noFooter?: boolean;
  noSources?: boolean;
  pageTitle?: string;
  whiteBackground?: boolean;
}

export type LayoutRouteData = Required<Pick<RouteData, "pageTitle">> &
  Omit<RouteData, "pageTitle"> & {
    isDocDetails?: boolean;
  };
