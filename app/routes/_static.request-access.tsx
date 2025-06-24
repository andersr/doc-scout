import { Link, useSearchParams } from "react-router";
import { PageTitle } from "~/components/PageTitle";
import { appRoutes } from "~/shared/appRoutes";
import { LINK_STYLES } from "~/styles/links";

export default function RequestAccessRoute() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  return (
    <div className="">
      <div className="mb-2 text-center">
        <PageTitle title={"Please Request Access"} />
      </div>
      <div className="prose">
        <p>
          Sorry, access to Doc Scout is currently invitation-only and it looks
          like the email you provided ({email}) doesn&apos;t have access to the
          app.
        </p>
        <p></p>
        <p>
          To request access,{" "}
          <a className={LINK_STYLES} href="https://forms.gle/zCJqHCCSBgyrN8EB6">
            please complete this form.
          </a>
        </p>
        <p>Thanks for your interest in Doc Scout.</p>
        <p>
          <Link className={LINK_STYLES} to={appRoutes("/login")}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
