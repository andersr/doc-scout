import { Outlet, useLoaderData } from "react-router";
import { maybeUser } from "~/.server/sessions/maybeUser";
import { UserNav } from "~/components/UserNav";
import type { Route } from "./+types/_main";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await maybeUser(request);

  return { user };
}

export default function MainRoutes() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <UserNav currentUser={user} />
      <Outlet />
    </div>
  );
}
