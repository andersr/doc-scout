import { Link, redirect, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
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
    pageData: {
      title: `Project: ${projectMembership.project?.name}`,
    },
  };
}

export default function ProjectDetails() {
  const { project } = useLoaderData<typeof loader>();

  const deleteFetcher = useFetcherWithReset<{
    errorMessage?: string;
  }>();

  return (
    <div>
      <ul>
        <li>
          <Link to={appRoutes("/projects/:id/keys", { id: project.publicId })}>
            API Keys
          </Link>
        </li>
        <li>
          <Link
            to={appRoutes("/projects/:id/sources", { id: project.publicId })}
          >
            Sources
          </Link>
        </li>
        <li>
          <Link
            to={appRoutes("/projects/:id/playground", { id: project.publicId })}
          >
            Playground
          </Link>
        </li>
      </ul>
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
    </div>
  );
}

// export async function action({ request, params }: Route.ActionArgs) {
//   const currentUser = await requireUser({ request });
//   try {
//     const user = await prisma.user.findUniqueOrThrow({
//       where: {
//         publicId: currentUser?.publicId ?? "",
//       },
//       include: {
//         projectMemberships: {
//           include: {
//             project: true,
//           },
//         },
//       },
//     });

//     const projectPublicId = requireParam({ params, key: "id" });
//     // TODO: turn into util
//     const projectMembership = user?.projectMemberships.find(
//       (pm) => pm.project?.publicId === projectPublicId,
//     );

//     if (!projectMembership) {
//       throw new Error(
//         "No matching project found or current user is not a member",
//       );
//     }

//     const projectId = projectMembership.project?.id;

//     if (!projectId) {
//       throw new Error("No project id found or current user is not a member");
//     }

//     const project = await prisma.project.findUniqueOrThrow({
//       where: { id: projectId ?? -1 },
//       include: {
//         sources: true,
//       },
//     });

//     if (!project.collectionName) {
//       throw new Error("missing collection name");
//     }

//     const graph = await generateGraph({
//       collectionName: project.collectionName,
//     });

//     const inputs = {
//       question: "What is AI Assistant Structured Output?",
//     };

//     const result = await graph.invoke(inputs);
//     console.info(result.answer);

//     return data<ActionData>({
//       errorMessage: "",
//       successMessage: "Something worked...",
//       ok: true,
//     });
//   } catch (error) {
//     console.error("URL submission error: ", error);
//     return data<ActionData>({
//       errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
//       ok: false,
//     });
//   }
// }
