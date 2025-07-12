import { Link } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { MUTED_LINK_STYLES } from "~/styles/links";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 pb-2 md:pb-4">
      <Link className={MUTED_LINK_STYLES} to={appRoutes("/privacy")}>
        Privacy
      </Link>
      <a
        className={MUTED_LINK_STYLES}
        href="https://github.com/andersr/doc-scout"
      >
        Github
      </a>
      <a className={MUTED_LINK_STYLES} href="mailto:info@docscout.app">
        Contact
      </a>
    </footer>
  );
}
