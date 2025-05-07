import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { ButtonLink } from "~/components/ButtonLink";
import { PageTitle } from "~/components/PageTitle";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth._index";

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
    <>
      <div className="mx-auto max-w-3xl">
        <PageTitle>Dashboard</PageTitle>
      </div>
      <div className="">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold mb-6 flex-1">Projects</h2>
          <ButtonLink to={appRoutes("/projects/new")}>New Project</ButtonLink>
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
    </>
  );
}
