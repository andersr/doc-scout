import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { appRoutes } from "~/shared/appRoutes";
import { MUTED_LINK_STYLES } from "~/styles/links";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppContainer({ children, className }: Props) {
  return (
    <div className={twMerge("flex h-full flex-col p-4", className)}>
      {children}
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
    </div>
  );
}
