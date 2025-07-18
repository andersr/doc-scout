import type { AppKeys } from "~/shared/keys";

export interface MenuActionInput {
  button?: {
    confirmMessage?: string;
    danger?: boolean;
    intent: AppKeys;
    label: React.JSX.Element | string;
  };
  link?: {
    label: React.JSX.Element | string;
    to: string;
  };
}

export interface MenuActionLink {
  label: React.JSX.Element | string;
  to: string;
}

export interface MenuActionButton {
  confirmMessage?: string;
  danger?: boolean;
  label: React.JSX.Element | string;
  onClick: () => void;
}

export interface MenuAction {
  button?: MenuActionButton;
  link?: MenuActionLink;
}
