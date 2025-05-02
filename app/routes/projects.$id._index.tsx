import { Link, useLoaderData } from "react-router";
import { getClientUser } from "~/.server/users/getClientUser";
import { requireParam } from "~/.server/utils/requireParam";
import { MainLayout } from "~/components/MainLayout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/dashboard";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });
    const projectId = requireParam({ params, key: "id" });

    const projectMembership = currentUser?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectId
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member"
      );
    }

    return { currentUser, project: projectMembership.project };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null, project: null };
  }
}

// add vectors to collection

export default function ProjectDetails() {
  const { currentUser, project } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">Project: {project?.name}</h1>
      </div>
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-xl font-bold mb-6">Sources</h2>
        {project?.publicId ? (
          <Link
            className="border p-1 rounded"
            to={appRoutes("/projects/:id/sources/new", {
              id: project?.publicId,
            })}
          >
            Add sources
          </Link>
        ) : (
          <span>No public id</span>
        )}
        <ul>
          {project?.sources.map((s) => (
            <li key={s.publicId}>
              {s.name} ({s.url})
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
