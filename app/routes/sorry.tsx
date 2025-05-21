import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";

export function meta() {
  return [{ title: "Sorry" }];
}

export default function SorryRoute() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div>
        Sorry, something went wrong. This could be due to a bad request or
        insufficient permissions. Please contact the site owner for more
        details.
      </div>
      <Link className="text-blue-600 underline" to={appRoutes("/")}>
        Back to Home
      </Link>
    </div>
  );
}
