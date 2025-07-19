import { Link } from "react-router";
import { twMerge } from "tailwind-merge";

export function FloatingCTA({
  icon,
  label,
  to,
}: {
  icon: React.JSX.Element;
  label?: string;
  to: string;
}) {
  return (
    <div className="fixed right-0 bottom-14 left-0 z-20 flex justify-center md:bottom-24">
      <Link
        className={twMerge(
          "bg-navy-blue flex items-center justify-center rounded-xl py-3 pr-6 pl-3 font-medium text-white drop-shadow-lg md:py-3 md:pr-8 md:pl-4 md:text-lg",
        )}
        to={to}
      >
        {icon}
        {label && <div className="pl-2">{label}</div>}
      </Link>
    </div>
  );
}
