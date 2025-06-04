import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { BUTTON_STYLES } from "~/styles/buttons";

interface Props {
  children: React.ReactNode;
}

export function ActionLink({ children, to }: Props & { to: string }) {
  return (
    <Link className={twMerge(BUTTON_STYLES)} to={to}>
      {children}
    </Link>
  );
}
