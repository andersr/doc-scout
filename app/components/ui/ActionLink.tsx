import { Link } from "react-router";
import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
}

const CONTAINER_STYLES =
  "bg-navy-blue/70 rounded px-4 md:px-8 py-2 md:py-3 md:text-xl font-light text-white whitespace-nowrap";

export function ActionLink({ children, to }: Props & { to: string }) {
  return (
    <Link className={twMerge(CONTAINER_STYLES)} to={to}>
      {children}
    </Link>
  );
}

export function ActionButton(
  props: Props & { disabled?: boolean; onClick?: () => void; type?: "submit" },
) {
  const { children, ...rest } = props;
  return (
    <button {...rest} className={twMerge(CONTAINER_STYLES, "cursor-pointer")}>
      {children}
    </button>
  );
}
