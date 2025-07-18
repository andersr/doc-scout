import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import type { APP_ICONS } from "~/config/icons";
import { Icon } from "../Icon";

export function FloatingCTA({
  icon,
  label,
  to,
}: {
  icon?: keyof typeof APP_ICONS;
  label?: string;
  to: string;
}) {
  return (
    <div className="fixed right-0 bottom-14 left-0 z-20 flex justify-center md:bottom-18">
      <Link
        className={twMerge(
          "bg-navy-blue flex items-center justify-center rounded-xl py-2 pr-5 pl-2 font-medium text-white drop-shadow-md md:drop-shadow-lg",
        )}
        to={to}
      >
        <Icon name={icon ?? "ADD"} fontSize="30px" />
        {label && <div className="pl-2">{label}</div>}
      </Link>
    </div>
  );
}
