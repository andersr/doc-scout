import { Link } from "react-router";

export interface ConditionalLinkProps {
  label: React.ReactNode;
  shouldLink: boolean;
  to: string;
}

export default function ConditionalLink({
  label,
  shouldLink,
  to,
}: ConditionalLinkProps) {
  return shouldLink ? (
    <div className="inline-block">{label}</div>
  ) : (
    <Link to={to} className="inline-block">
      {label}
    </Link>
  );
}
