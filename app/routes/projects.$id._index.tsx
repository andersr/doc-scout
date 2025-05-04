import { data, Form, Link, useActionData, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { prisma } from "~/.server/prisma/client";
import { getClientUser } from "~/.server/users/getClientUser";
import { requireParam } from "~/.server/utils/requireParam";
import { MainLayout } from "~/components/MainLayout";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Project Details" }, { name: "description", content: "" }];
}

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

export default function ProjectDetails() {
  const { currentUser, project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">Project: {project?.name}</h1>
      </div>
      <div className="mx-auto max-w-3xl px-4">
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
        <h2 className="text-xl font-bold mb-6">Sources</h2>
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Form method="POST" className="flex flex-col gap-4">
          <button
            type="submit"
            className={twMerge(
              "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full border cursor-pointer"
            )}
          >
            generate graph
          </button>
        </Form>

        {actionData?.errorMessage && (
          <div className="mt-4 text-center font-semibold text-red-400">
            {actionData.errorMessage}
          </div>
        )}

        {actionData?.successMessage && (
          <div className="mt-4 text-center font-semibold text-green-500">
            {actionData.successMessage}
            {actionData.s3Key && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Saved to S3 with key:</p>
                <code className="block mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                  {actionData.s3Key}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });
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
      (pm) => pm.project?.publicId === projectPublicId
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member"
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

    let inputs = {
      question: "What is AI Assistant Structured Output?",
    };

    const result = await graph.invoke(inputs);
    console.log(result.answer);

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
