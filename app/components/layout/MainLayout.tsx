import { AppContainer } from "~/components/layout/AppContainer";
import AppHeader, { type AppHeaderProps } from "~/components/layout/AppHeader";
import { Footer } from "~/components/layout/Footer";
import { MainContent } from "~/components/layout/MainContent";

export function MainLayout({
  children,
  leftNav,
  rightNav,
}: { children: React.ReactNode } & AppHeaderProps) {
  return (
    <AppContainer>
      <AppHeader leftNav={leftNav} rightNav={rightNav} />
      <MainContent>{children}</MainContent>
      <Footer />
    </AppContainer>
  );
}
