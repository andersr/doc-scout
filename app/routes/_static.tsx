import { Outlet } from "react-router";

import { AppContainer } from "~/components/AppContainer";
import AppHeader from "~/components/AppHeader";
import { MainContentContainer } from "~/components/MainContentContainer";

export default function StaticLayout() {
  return (
    <AppContainer>
      <AppHeader />
      <MainContentContainer>
        <div className="mx-auto w-lg">
          <Outlet />
        </div>
      </MainContentContainer>
    </AppContainer>
  );
}
