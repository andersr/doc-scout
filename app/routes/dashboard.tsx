import { useLoaderData } from "react-router";
import { requireUser } from "~/.server/sessions/requireUser";
import { getClientUser } from "~/.server/utils/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const internalUser = await requireUser({ request });

    return { currentUser: getClientUser(internalUser) };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();

  return <MainLayout currentUser={currentUser}>DASHBOARD</MainLayout>;
}
