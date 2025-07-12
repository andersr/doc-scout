import { Outlet } from "react-router";

import { AppContainer } from "~/components/layout/AppContainer";
import AppHeader from "~/components/layout/AppHeader";
import { Footer } from "~/components/layout/Footer";
import { MainContent } from "~/components/layout/MainContent";
import { ErrorBoundaryInfo } from "~/lib/errorBoundary/ErrorBoundaryInfo";
import { useErrorBoundary } from "~/lib/errorBoundary/useErrorBoundary";
import type { Route } from "./+types/_anon";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppContainer>
      <AppHeader />
      <MainContent>{children}</MainContent>
      <Footer />
    </AppContainer>
  );
}

export default function AnonRoutes() {
  return (
    <Layout>
      <div className="mx-auto flex-1 md:w-lg">
        <Outlet />
      </div>
    </Layout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const output = useErrorBoundary(error);

  return (
    <Layout>
      <ErrorBoundaryInfo {...output} />
    </Layout>
  );
}
