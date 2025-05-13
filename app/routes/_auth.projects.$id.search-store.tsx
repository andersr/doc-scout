import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { data, Form, redirect, useLoaderData } from "react-router";
import { getBucketData } from "~/.server/aws/getFromBucket";
import { getVectorStore } from "~/.server/langchain/vectorStore";
import { requireProjectById } from "~/.server/projects/requireProjectById";
import { requireUser } from "~/.server/users/requireUser";
import { Button } from "~/components/ui/button";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import { APIError } from "~/types/api";
import type { LCDocument } from "~/types/document";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id._index";

const SECTION_NAME = "Search Store";

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
  const user = await requireUser(args);

  const project = await requireProjectById({ user, params: args.params });

  return { project };
}

export default function SearchStore() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <div>
      <Form method="POST" className="flex flex-col gap-4">
        <Button type="submit">Update</Button>
      </Form>
      {/* {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )} */}
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

    const sourcePaths = project.sources
      .map((s) => s.storagePath)
      .filter((p) => p !== null);

    if (sourcePaths.length === 0) {
      return data<ActionData>({
        errorMessage: "No source paths found.",
        ok: false,
      });
    }

    const sourceData = await getBucketData(sourcePaths);

    const docs: LCDocument[] = sourceData.map((s) => ({
      pageContent: s.markdown,
      id: project.sources[0].publicId,
      metadata: {
        title: s.metadata.title,
        url: project.sources[0].url,
      },
    }));

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    const vectorStore = await getVectorStore(project.collectionName);

    // TODO: only delete if not empty
    // await vectorStore.delete({
    //   deleteAll: true,
    //   namespace: project.collectionName,
    // });

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

// CHUNK IDS:
// ids:  [
//   '9ed851ea-5522-439b-bdfc-93cda4345079',
//   '9db31c7a-1f72-41d6-bfec-ab53650a1ed3',
//   '9139122b-93c7-4bde-9be7-1cac1d8ff392',
//   '9afc2188-e40a-4760-8257-7b26e0bd2733',
//   '6c7fbeb4-b5a7-4147-ad5c-e4d2be9661a3',
//   '0cc5db32-1033-4dd4-95f5-2dc6dcefc73e',
//   'c9d8ffe5-3531-4642-a292-98622642cab6',
//   'a8afb6db-c7e9-4d9a-ae2e-31a48cbbe687',
//   'e8ace410-cb79-4cb0-8101-184964b237c0',
//   '4d2cda73-cb29-465e-ab20-189f09d1caee',
//   '58bf8f18-f048-40be-9c85-d8d00b84dfae',
//   'e5bbf000-d7f3-41e3-8465-c65b8bd2c2bd',
//   '717245c6-2dcf-4591-ba84-c8664a0c8b93',
//   '5d3bcfa5-d54a-4fce-8916-1dd3936bacc8',
//   '8deddb1e-a957-4e37-8227-e7fecf4e5774',
//   '4ba921c6-fcb4-441b-9b65-20f522df57e1',
//   'e3916cd6-58c9-4002-bd45-de48a3147d85',
//   '9d99a310-c7f9-44c8-8e8e-7f48e1caf631',
//   'c814859e-336e-453c-895e-eb3b10397ed3',
//   'b2d8cbde-c5eb-4e0b-bec4-2e631bcea35f',
//   '98fb3fe7-dbc6-4e49-9e85-016d1014894c'
// ]

// const sourcePaths = getSourcePaths(sources);

// if (sourcePaths.length === 0) {
//   return data<ActionData>({
//     errorMessage: "No source paths found.",
//     ok: false,
//   });
// }

// add to vector db: https://qdrant.tech/documentation/examples/rag-chatbot-scaleway/ https://js.langchain.com/docs/introduction/ https://www.npmjs.com/package/@qdrant/qdrant-js https://js.langchain.com/docs/tutorials/rag
// will work for a single file, but not ideal for batches

// update so that generating the chunks and embeddings is a separate step, which reads from the s3 files

// Return success with the S3 key
// return data<ActionData>({
//   url,
//   successMessage: "URL submitted and saved to S3 successfully!",
//   ok: true,
//   s3Key,
// });
// return redirect(appRoutes("/projects/:id", { id: project.publicId }));
