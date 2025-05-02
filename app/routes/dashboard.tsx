import { Link, useLoaderData } from "react-router";
import { getClientUser } from "~/.server/users/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });

    // const result = await qdClient.createCollection("test_collection", {
    //   vectors: { size: 4, distance: "Dot" },
    // });
    // console.log("List of collections:", result.collections);
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
        <Link className="border p-1 rounded" to={appRoutes("/projects/new")}>
          New Project
        </Link>
        <ul>
          {currentUser?.projectMemberships.map((p) => (
            <li key={p.project?.publicId}>
              {p.project?.publicId ? (
                <Link
                  to={appRoutes("/projects/:id", { id: p.project?.publicId })}
                >
                  {p.project?.name}
                </Link>
              ) : (
                <span>{p.project?.name} (no public id)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
