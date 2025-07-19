import type { AppKeys } from "~/shared/keys";

export interface MenuActionInput {
  button?: {
    action: string;
    confirmMessage?: string;
    danger?: boolean;
    intent: AppKeys;
    label: React.JSX.Element | string;
    method?: "DELETE";
  };
  link?: {
    label: React.JSX.Element | string;
    to: string;
  };
}

export interface MenuActionLink {
  label: React.JSX.Element | string;
  onClick?: () => void; // needed to close the menu panel on mobile after the user clicks the link
  to: string;
}

export interface MenuActionButton {
  confirmMessage?: string;
  danger?: boolean;
  label: React.JSX.Element | string;
  onClick?: () => void; // TODO: this should really be required for for more menu actions
  type?: "submit";
}

export interface MenuAction {
  button?: MenuActionButton;
  link?: MenuActionLink;
}
