import { useLoaderData } from "react-router";
import { maybeUser } from "~/.server/sessions/maybeUser";
import { getClientUser } from "~/.server/utils/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Research App" }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const internalUser = await maybeUser(request);

    return { currentUser: internalUser ? getClientUser(internalUser) : null };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

export default function Home() {
  const { currentUser } = useLoaderData<typeof loader>();
  return <MainLayout currentUser={currentUser}>HOME</MainLayout>;
}
