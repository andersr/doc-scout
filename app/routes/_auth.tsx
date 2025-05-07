import { Outlet, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { MainLayout } from "~/components/MainLayout";
import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Dashboard" }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });

  return { currentUser };
}

export default function AuthLayout() {
  const { currentUser } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <Outlet />
    </MainLayout>
  );
}
