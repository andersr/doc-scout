import { Link } from "react-router";

interface Props {
  children: React.ReactNode;
}

export function ActionLink({ children, to }: Props & { to: string }) {
  return (
    <Link
      className="bg-navy-blue/70 rounded px-6 py-2 text-xl font-light text-white"
      to={to}
    >
      {children}
    </Link>
  );
}

export function ActionButton(
  props: Props & { onClick?: () => void; type?: "submit" },
) {
  const { children, ...rest } = props;
  return (
    <button
      {...rest}
      className="bg-navy-blue/70 rounded px-6 py-2 text-xl font-light text-white"
    >
      {children}
    </button>
  );
}
