import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { AppContainer } from "~/components/layout/AppContainer";
import { useIsRoute } from "~/hooks/useIsRoute";
import { useIsScrolling } from "~/hooks/useIsScrolling";
import { useResponsive } from "~/hooks/useResponsive";
import { appRoutes } from "~/shared/appRoutes";
import type { MenuAction } from "~/types/menu";
import type { LayoutRouteData } from "~/types/routes";
import type { UserClient } from "~/types/user";
import { setWindowTitle } from "~/utils/setWindowTitle";
import { Logo } from "../brand/Logo";
import { MoreMenu } from "../MoreMenu";
import { Icon } from "../ui/Icon";
import { UserMenu } from "../user/UserMenu";
import { Footer } from "./Footer";
import { PageTitle } from "./PageTitle";

export function MainLayout({
  centeredPageTitle,
  children,
  moreActions,
  noFooter,
  pageTitle,
  user,
  whiteBackground,
}: { children: React.ReactNode } & LayoutRouteData & {
    centeredPageTitle?: boolean;
    moreActions?: MenuAction[];
    noFooter?: boolean;
    user: UserClient | null;
  }) {
  const { isMobile } = useResponsive();

  const { isHome } = useIsRoute();

  function setLeftNav() {
    if (isMobile) {
      if (user?.sources?.length === 0) {
        return <span className="w-12">&nbsp;</span>;
      }
      return isHome ? (
        <Logo />
      ) : (
        <Link className="pt-1 pl-3" to={appRoutes("/")}>
          <Icon name="BACK" fontSize="28px" />
        </Link>
      );
    }

    return <Logo withText shouldLink={!isHome} to={appRoutes("/")} />;
  }

  function setRightNav() {
    if (isMobile) {
      return moreActions && moreActions.length > 0 ? (
        <MoreMenu actions={moreActions} />
      ) : (
        <UserMenu user={user} />
      );
    }

    return <UserMenu user={user} />;
  }

  const { componentRef, isScrolling } = useIsScrolling();

  return (
    <>
      <title>{setWindowTitle(pageTitle)}</title>
      <AppContainer>
        <header
          className={twMerge(
            "md:bg-background fixed top-0 right-0 left-0 z-30 bg-white md:static",
            isScrolling ? "drop-shadow md:drop-shadow-none" : "",
          )}
        >
          <div className="flex size-full h-16 flex-row items-center justify-between md:h-18">
            {setLeftNav()}
            {isMobile && pageTitle ? (
              <div className="flex flex-1 items-center justify-center">
                <PageTitle centered>{pageTitle}</PageTitle>
              </div>
            ) : (
              <div className="flex-1">&nbsp;</div>
            )}
            <span className="pt-1 pr-2">{setRightNav()}</span>
          </div>
        </header>
        <main
          ref={componentRef}
          className={twMerge(
            "mt-14 flex flex-1 flex-col gap-2 overflow-auto md:relative md:mt-0",
            whiteBackground && "rounded-xl bg-white",
          )}
        >
          <div
            className={twMerge("z-20 hidden md:fixed md:inset-x-0 md:block")}
          >
            <div
              className={twMerge(
                "flex items-center justify-between p-4 md:mx-auto md:w-3xl",
                isScrolling ? "drop-shadow" : "",
                whiteBackground && "bg-white",
              )}
            >
              <PageTitle
                customStyles="md:text-5xl"
                centered={centeredPageTitle}
              >
                {pageTitle}
              </PageTitle>
              {moreActions && moreActions.length > 0 && (
                <MoreMenu actions={moreActions} />
              )}
            </div>
          </div>
          <div className="my-6 flex flex-1 flex-col px-4 md:mt-22">
            {children}
          </div>
          {noFooter ? null : (
            <div className="pt-4 pb-6 md:hidden">
              <Footer />
            </div>
          )}
        </main>
        <div className="hidden py-4 md:block">
          <Footer />
        </div>
      </AppContainer>
    </>
  );
}
