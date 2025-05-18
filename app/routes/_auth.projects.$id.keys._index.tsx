import { data, redirect, useLoaderData } from "react-router";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { LinkButton } from "~/components/ui/button";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id._index";

const SECTION_NAME = "API Keys";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Project: ${data.project?.name} > ${SECTION_NAME}` },
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

export default function ProjectSources() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <>
      <LinkButton
        to={appRoutes("/projects/:id/keys/new", { id: project.publicId })}
      >
        Add API Key
      </LinkButton>
      <ul>
        {project.apiKeys.map((apiKey) => (
          <li key={apiKey.id}>{apiKey.name}</li>
        ))}
      </ul>
    </>
  );
}

export async function action(args: Route.ActionArgs) {
  const currentUser = await requireUser(args);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        publicId: currentUser?.publicId ?? "",
      },
      include: {
        projectMemberships: {
          include: {
            project: true,
          },
        },
      },
    });

    const projectPublicId = requireParam({ params: args.params, key: "id" });
    // TODO: turn into util
    const projectMembership = user?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectPublicId,
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member",
      );
    }

    const projectId = projectMembership.project?.id;

    if (!projectId) {
      throw new Error("No project id found or current user is not a member");
    }

    const project = await prisma.project.findUniqueOrThrow({
      where: { id: projectId ?? -1 },
      include: {
        sources: true,
      },
    });

    if (!project.collectionName) {
      throw new Error("missing collection name");
    }

    const graph = await generateGraph({
      namespace: project.collectionName,
    });

    const inputs = {
      question: "What is AI Assistant Structured Output?",
    };

    const result = await graph.invoke(inputs);
    console.info(result.answer);

    return data<ActionData>({
      errorMessage: "",
      successMessage: "Something worked...",
      ok: true,
    });
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}
