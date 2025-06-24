import { Outlet } from "react-router";

import { AppContainer } from "~/components/AppContainer";
import AppHeader from "~/components/AppHeader";

export default function StaticLayout() {
  return (
    <AppContainer>
      <AppHeader />
      <main className="mx-auto flex w-full flex-1 flex-col gap-6 py-6 md:max-w-5xl md:min-w-3xl md:py-12">
        <div className="mx-auto w-lg">
          <Outlet />
        </div>
      </main>
    </AppContainer>
  );
}
