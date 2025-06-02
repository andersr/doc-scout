import { data, Link, Outlet, useLoaderData } from "react-router";

import { requireUser } from "~/.server/users";
import { Avatar } from "~/components/Avatar";
import { BaseLayout } from "~/components/BaseLayout";
import { FoldedDoc } from "~/components/brand/FoldedDoc";
import { Icon } from "~/components/icon";
import { POMPADOUR_PURPLE } from "~/config/theme";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Doc Scout" }, { content: "", name: "description" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await requireUser({ request });

  return data(
    { user },
    {
      // headers: {
      //   "Set-Cookie": await authSessionStore.commitSession(session),
      // },
    },
  );
}

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <BaseLayout>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Link
            className="text-pompadour/70 flex items-center"
            to={appRoutes("/")}
          >
            <FoldedDoc size={24} color={POMPADOUR_PURPLE} />
            <div className="pl-2 text-3xl font-stretch-50%">Doc Scout</div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link className="flex items-center" to={appRoutes("/docs")}>
            <Icon
              name="DOCUMENTS"
              fontSize="34px"
              customStyles="text-stone-500"
              label="documents"
            />
          </Link>
          <Link className="flex items-center" to={appRoutes("/chats")}>
            <Icon
              name="CHATS"
              fontSize="34px"
              customStyles="text-stone-500"
              label="chats"
            />
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div>
                <Avatar email={user.email} />
              </div>
            </div>
          ) : (
            <div>
              <Link to={appRoutes("/login")}>Sign In</Link>
            </div>
          )}
        </div>
      </div>
      <main className="flex flex-1 flex-col py-4">
        <Outlet />
      </main>
    </BaseLayout>
  );
}
// {/* <Logout /> */}
