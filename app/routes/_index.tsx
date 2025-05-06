import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { MainLayout } from "~/components/MainLayout";
import { PageTitle } from "~/components/PageTitle";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_index";

export function meta() {
  return [{ title: "Dashboard" }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });

  return { currentUser };
}

export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl">
        <PageTitle>Dashboard</PageTitle>
      </div>
      <div className="">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold mb-6 flex-1">Projects</h2>
          <Link className="border p-1 rounded" to={appRoutes("/projects/new")}>
            New Project
          </Link>
        </div>

        <ul>
          {currentUser?.projectMemberships.map((p) => (
            <li key={p.project?.publicId} className="pb-2">
              {p.project?.publicId ? (
                <Link
                  to={appRoutes("/projects/:id", { id: p.project?.publicId })}
                  className="underline text-blue-600"
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
