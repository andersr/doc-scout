import { Outlet, redirect, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { PageTitle } from "~/components/PageTitle";
import { useRouteData } from "~/hooks/useRouteData";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth.projects.$id._index";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Project: ${data.project?.name}` },
    { name: "description", content: "" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const currentUser = await requireUser(args);
  const projectId = requireParam({ params: args.params, key: "id" });

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

  return { project: projectMembership.project };
}

export default function ProjectDetails() {
  const { project } = useLoaderData<typeof loader>();

  const routeData = useRouteData();

  return (
    <>
      <PageTitle>
        Project: {project?.name} - {routeData?.pageTitle}
      </PageTitle>
      <Outlet />
    </>
  );
}

// export async function action(args: Route.ActionArgs) {
//   const currentUser = await requireUser(args);
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

//     const projectPublicId = requireParam({ params: args.params, key: "id" });
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
