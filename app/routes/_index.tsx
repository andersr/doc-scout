import console from "console";
import { useLoaderData } from "react-router";

import { getClientUser } from "~/.server/users/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import type { Route } from "./+types/_index";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request });

    return { currentUser };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

export default function Home() {
  const { currentUser } = useLoaderData<typeof loader>();
  return <MainLayout currentUser={currentUser}>TBD</MainLayout>;
}
