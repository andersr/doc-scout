import { Link } from "react-router";

export interface ConditionalLinkProps {
  children: React.ReactNode;
  linkStyles?: string;
  shouldLink: boolean;
  to: string;
}

export default function ConditionalLink({
  children,
  linkStyles,
  shouldLink,
  to,
}: ConditionalLinkProps) {
  return shouldLink ? (
    <Link className={linkStyles} to={to}>
      {children}
    </Link>
  ) : (
    <div className="inline-block">{children}</div>
  );
}
