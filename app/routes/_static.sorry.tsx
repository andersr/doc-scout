import { Link } from "react-router";
import { PageTitle } from "~/components/PageTitle";
import { appRoutes } from "~/shared/appRoutes";
import { LINK_STYLES } from "~/styles/links";

export default function SorryRoute() {
  return (
    <div>
      <div className="text-center">
        <PageTitle title={"Sorry!"} />
      </div>
      <div>
        Sorry, something went wrong. This could be due to a bad request or
        insufficient permissions. Please contact the site owner for more
        details.
      </div>
      <Link className={LINK_STYLES} to={appRoutes("/")}>
        Back to Home
      </Link>
    </div>
  );
}
