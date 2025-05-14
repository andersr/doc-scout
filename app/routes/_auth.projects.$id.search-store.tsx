import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { data, Form, redirect, useActionData } from "react-router";
import { getBucketData } from "~/.server/aws/getFromBucket";
import { getResetVectorStore } from "~/.server/langchain/getResetVectorStore";
import { requireProjectById } from "~/.server/projects/requireProjectById";
import { requireUser } from "~/.server/users/requireUser";
import { Button } from "~/components/ui/button";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { APIError } from "~/types/api";
import type { LCDocument } from "~/types/document";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id._index";

const SECTION_NAME = "Search Store";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `Project: ${data.project?.name} > ${SECTION_NAME}` }];
}

export async function loader(args: Route.LoaderArgs) {
  const user = await requireUser(args);

  const project = await requireProjectById({ user, params: args.params });

  return { project };
}

export default function SearchStore() {
  const actionData = useActionData<typeof action>();
  return (
    <div>
      <Form method="POST" className="flex flex-col gap-4">
        <Button type="submit">Update</Button>
      </Form>
      {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )}
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const user = await requireUser(args);
  try {
    const project = await requireProjectById({ user, params: args.params });

    if (!project.collectionName) {
      throw new Error("no collection name found");
    }

    const sources = project.sources;

    if (sources.length === 0) {
      throw new Error("no sources found");
    }

    const docs: LCDocument[] = [];

    for (let index = 0; index < sources.length; index++) {
      const storagePath = sources[index].storagePath;

      if (!storagePath) {
        console.warn(`No storage path found for source ${sources[index].id}`);
        continue;
      }
      const data = await getBucketData(storagePath);

      docs.push({
        pageContent: data.markdown,
        id: sources[index].publicId,
        metadata: {
          title: sources[index].name,
          url: sources[index].url,
        },
      });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    const vectorStore = await getResetVectorStore(project.collectionName);

    await vectorStore.addDocuments(allSplits);

    // TODO: display confirmation flash message
    return redirect(appRoutes("/projects/:id", { id: project.publicId }));
  } catch (error) {
    console.error("error: ", error);

    // TODO:review this
    return data(
      {
        errorMessage:
          error instanceof Error && error.message
            ? error.message
            : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        ok: false,
      },
      error instanceof APIError ? error.statusCode : undefined,
    );
  }
}
