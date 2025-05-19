import { data, Form, redirect, useActionData } from "react-router";
import { getBucketData } from "~/.server/aws/getFromBucket";
import { getResetVectorStore } from "~/.server/langchain/getResetVectorStore";
import { splitDocuments } from "~/.server/langchain/splitDocuments";
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

  const project = await requireProjectById({ params: args.params, user });

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
    const project = await requireProjectById({ params: args.params, user });

    if (!project.collectionName) {
      throw new Error("no collection name found");
    }

    const sources = project.sources;

    if (sources.length === 0) {
      throw new Error("no sources found");
    }

    const docs: LCDocument[] = [];

    for (let index = 0; index < sources.length; index++) {
      const textData = sources[index].text;
      const storagePath = sources[index].storagePath;

      if (!textData && !storagePath) {
        console.warn(`No data found for source ${sources[index].id}, skipping`);
        continue;
      }

      const storageData = storagePath ? await getBucketData(storagePath) : null;

      if (storageData) {
        docs.push({
          metadata: {
            sourceId: sources[index].publicId,
            title: sources[index].name,
            url: sources[index].url,
          },
          pageContent: storageData.markdown,
        });
      }

      if (textData) {
        docs.push({
          metadata: {
            sourceId: sources[index].publicId,
            title: sources[index].name,
            type: "markdown", // for now, create actual doc types
          },
          pageContent: textData,
        });
      }
    }

    const allSplits = await splitDocuments(docs);

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
