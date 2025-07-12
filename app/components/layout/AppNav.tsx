import { Link } from "react-router";

import { appRoutes } from "~/shared/appRoutes";

const NAV_LINKS: { label: string; route: string }[] = [
  { label: "Dashboard", route: appRoutes("/dashboard") },
];

export function AppNav() {
  return (
    <nav className="text-pompadour/80 mt-1">
      <ul>
        {NAV_LINKS.map((l) => (
          <Link
            className="text-2xl font-stretch-50% md:text-3xl"
            key={l.label}
            to={l.route}
          >
            {l.label}
          </Link>
        ))}
      </ul>
    </nav>
  );
}
