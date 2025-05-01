import { useLoaderData } from "react-router";
import { getClientUser } from "~/.server/users/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });

    return { currentUser };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-xl font-bold mb-6">Projects</h2>
      </div>
    </MainLayout>
  );
}
