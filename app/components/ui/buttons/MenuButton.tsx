import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import type { MenuActionButton, MenuActionLink } from "~/types/menu";

const BTN_STYLES =
  "cursor-pointer flex w-full items-center hover:bg-stone-100 transition-all duration-200 ease-in-out p-2";

export function MenuButton({ danger, label, onClick, type }: MenuActionButton) {
  return (
    <button
      type={type ?? "button"}
      className={twMerge(BTN_STYLES, danger ? "text-danger" : "")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function MenuLink({ label, onClick, to }: MenuActionLink) {
  return (
    <Link className={twMerge(BTN_STYLES)} to={to} onClick={onClick}>
      {label}
    </Link>
  );
}
