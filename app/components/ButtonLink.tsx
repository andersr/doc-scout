import { Link } from "react-router";

export function ButtonLink({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) {
  return (
    <Link to={to} className="border px-2 py-1 rounded">
      {children}
    </Link>
  );
}
