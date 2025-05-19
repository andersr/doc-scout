import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { PageTitle } from "~/components/PageTitle";
import { LinkButton } from "~/components/ui/button";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "../+types/root";

export function meta() {
  return [{ title: "Dashboard" }, { content: "", name: "description" }];
}

export async function loader(args: Route.LoaderArgs) {
  const user = await requireUser(args);

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <PageTitle>Dashboard</PageTitle>
      </div>
      <div className="">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold mb-6 flex-1">Queries</h2>
          <LinkButton to={appRoutes("/queries/new")}>New Query</LinkButton>
        </div>
        <ul>
          {user?.projectMemberships?.map((p) => (
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
    </>
  );
}
