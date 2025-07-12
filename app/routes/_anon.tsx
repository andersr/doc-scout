import { Outlet } from "react-router";

import { AppContainer } from "~/components/layout/AppContainer";
import AppHeader from "~/components/layout/AppHeader";
import { MainContentContainer } from "~/components/layout/MainContentContainer";
import { ErrorBoundaryInfo } from "~/lib/errorBoundary/ErrorBoundaryInfo";
import { useErrorBoundary } from "~/lib/errorBoundary/useErrorBoundary";
import type { Route } from "./+types/_anon";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppContainer>
      <AppHeader />
      <MainContentContainer>{children}</MainContentContainer>
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
