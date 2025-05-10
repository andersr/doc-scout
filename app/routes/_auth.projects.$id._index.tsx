import { Link, redirect, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { requireUser } from "~/.server/users/requireUser";
import { getDomainHost } from "~/.server/utils/getDomainHost";
import { requireParam } from "~/.server/utils/requireParam";
import { CopyButton } from "~/components/buttons/CopyButton";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth.projects.$id._index";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Project: ${data.project?.name}` },
    { name: "description", content: "" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });
  const projectId = requireParam({ params, key: "id" });

  const projectMembership = currentUser?.projectMemberships.find(
    (pm) => pm.project?.publicId === projectId,
  );

  // Add alert via AlertProvider OR flash message provider
  if (!projectMembership) {
    console.warn("user is not a member");
    throw redirect(appRoutes("/"));
  }
  if (!projectMembership.project) {
    console.warn("No project found");
    throw redirect(appRoutes("/"));
  }

  return {
    currentUser,
    project: projectMembership.project,
    apiHost: getDomainHost({ request, withProtocol: true }),
    pageData: {
      title: `Project: ${projectMembership.project?.name}`,
    },
  };
}

export default function ProjectDetails() {
  const { project, apiHost } = useLoaderData<typeof loader>();

  const deleteFetcher = useFetcherWithReset<{
    errorMessage?: string;
  }>();

  const { handleCopyClick, didCopy } = useCopyToClipboard({
    withTimeout: true,
  });

  const endPoint = `${apiHost}/api/v1/projects/${project.publicId}`;

  const navLinks: { to: string; label: string }[] = [
    {
      to: appRoutes("/projects/:id/keys", { id: project.publicId }),
      label: "API Keys",
    },
    {
      to: appRoutes("/projects/:id/sources", { id: project.publicId }),
      label: "Sources",
    },
    {
      to: appRoutes("/projects/:id/search-store", { id: project.publicId }),
      label: "Update Search Store",
    },
    {
      to: appRoutes("/projects/:id/playground", { id: project.publicId }),
      label: "Playground",
    },
  ];
  return (
    <>
      <div className="flex-1 w-full">
        <ul className="w-full">
          {navLinks.map((n) => (
            <li className="pb-1" key={n.to}>
              <Link className="underline text-blue-500" to={n.to}>
                {n.label}
              </Link>
            </li>
          ))}
          <li className="w-full flex flex-wrap">
            <span className="flex-1">Endpoint: {endPoint}</span>{" "}
            <CopyButton
              onClick={() => {
                handleCopyClick(endPoint);
              }}
              copyDone={didCopy}
            />
          </li>
        </ul>
      </div>
      <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
      <h2>Danger Zone</h2>
      <div className="p-4">
        <deleteFetcher.Form
          method="DELETE"
          action={appRoutes("/resources/projects/:id", {
            id: project.publicId,
          })}
          onSubmit={(event) => {
            if (!confirm("Are you sure?")) {
              event.preventDefault();
            }
          }}
        >
          <button type="submit" className={twMerge("")}>
            Delete project
          </button>
        </deleteFetcher.Form>
        {deleteFetcher?.data?.errorMessage && (
          <div className="mt-4 text-center font-semibold text-red-400">
            {deleteFetcher?.data?.errorMessage}
          </div>
        )}
      </div>
    </>
  );
}
