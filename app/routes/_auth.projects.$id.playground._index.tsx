import { data, Link, useActionData, useLoaderData } from "react-router";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { MainLayout } from "~/components/MainLayout";
import { PageTitle } from "~/components/PageTitle";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { Route } from "./+types/_auth.projects.$id._index";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Project: ${data.project?.name} > Sources` },
    { name: "description", content: "" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });
  try {
    const projectId = requireParam({ params, key: "id" });

    const projectMembership = currentUser?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectId,
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member",
      );
    }

    return { currentUser, project: projectMembership.project };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null, project: null };
  }
}

export default function ProjectPlayground() {
  const { currentUser, project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const deleteFetcher = useFetcherWithReset<{
    errorMessage?: string;
  }>();

  return (
    <MainLayout currentUser={currentUser}>
      <PageTitle>Project: {project?.name} - Playground</PageTitle>
      <div className="">
        {project?.publicId ? (
          <Link
            className="underline text-blue-600"
            to={appRoutes("/projects/:id/vectorize", {
              id: project?.publicId,
            })}
          >
            Vectorize
          </Link>
        ) : (
          <span>No public id</span>
        )}
        {project?.publicId ? (
          <Link
            className="underline text-blue-600"
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

export async function action({ request, params }: Route.ActionArgs) {
  const currentUser = await requireUser({ request });
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

    const projectPublicId = requireParam({ params, key: "id" });
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
      collectionName: project.collectionName,
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
