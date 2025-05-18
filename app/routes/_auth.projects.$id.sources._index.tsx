import type { Source } from "@prisma/client";
import { useState } from "react";
import Markdown from "react-markdown";
import { data, Link, redirect, useLoaderData } from "react-router";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id._index";

const SECTION_NAME = "Sources";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Project: ${data.project?.name} > ${SECTION_NAME}` },
    // { name: "description", content: "" },
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
  const [selectedSource, setSelectedSource] = useState<{
    id: string;
    text: string | null;
  } | null>(null);

  const handleSourceClick = (source: Source) => {
    if (source.url) {
      // If source has a URL, open it in a new tab
      window.open(source.url, "_blank");
    } else if (source.text) {
      // If source has text (markdown), display it
      setSelectedSource({
        id: source.publicId,
        text: source.text,
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3">
        {project?.publicId ? (
          <div className="flex gap-4 mb-4">
            <Link
              className="underline text-blue-600"
              to={appRoutes("/projects/:id/sources/new", {
                id: project?.publicId,
              })}
            >
              Add sources
            </Link>
            <Link
              className="underline text-blue-600"
              to={appRoutes("/projects/:id/sources/upload", {
                id: project?.publicId,
              })}
            >
              Upload files
            </Link>
          </div>
        ) : (
          <span>No public id</span>
        )}
        <ul className="space-y-2">
          {project?.sources.map((s) => (
            <li
              key={s.publicId}
              className={`cursor-pointer hover:text-blue-600 ${
                selectedSource?.id === s.publicId ? "font-bold" : ""
              }`}
              onClick={() => handleSourceClick(s)}
            >
              {s.name} {s.url ? "(url)" : s.text ? "(markdown)" : ""}
            </li>
          ))}
        </ul>
      </div>

      {selectedSource && (
        <div className="md:w-2/3">
          <h2 className="text-xl mb-2">Source Content</h2>
          <div className="border border-gray-300 rounded-md p-4 max-h-[80%] overflow-y-auto">
            <div className="prose dark:prose-invert">
              <Markdown>{selectedSource.text || ""}</Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
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
