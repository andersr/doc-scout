import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "node_modules/@langchain/core/dist/documents";
import { data, Form, useActionData, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { getBucketData } from "~/.server/aws/getFromBucket";
import { prisma } from "~/lib/prisma";
// import { vectorStore } from "~/.server/langchain/vectorStore";
// import { vectorStore } from "~/.server/langchain/vectorStore";
import { getVectorStore } from "~/.server/langchain/vectorStore";
import { getClientUser } from "~/.server/users/getClientUser";
import { requireParam } from "~/.server/utils/requireParam";
import { MainLayout } from "~/components/MainLayout";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Vectorize" }, { name: "description", content: "" }];
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
  const actionData = useActionData<typeof action>();

  const { currentUser, project } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">
          Vectorize sources: {project?.name}
        </h1>
      </div>
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-xl font-bold mb-6">Sources</h2>
        <ul>
          {project?.sources.map((s) => (
            <li key={s.publicId}>
              {s.name} ({s.url})
            </li>
          ))}
        </ul>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Form method="POST" className="flex flex-col gap-4">
            <button
              type="submit"
              className={twMerge(
                "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full border cursor-pointer"
              )}
            >
              Vectorize
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

    const sourcePaths = project.sources
      .map((s) => s.storagePath)
      .filter((p) => p !== null);
    console.log("sourcePaths: ", sourcePaths);

    if (sourcePaths.length === 0) {
      return data<ActionData>({
        errorMessage: "No source paths found.",
        ok: false,
      });
    }

    const sourceData = await getBucketData(sourcePaths);

    const docs: Document[] = sourceData.map((s) => ({
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

    // const now = new Date();
    // let timeId = now.getTime();

    // const pcRecords: { _id: string; chunk_text: string }[] = [];

    // for (let index = 0; index < allSplits.length; index++) {
    //   pcRecords.push({
    //     _id: uuidv4(),
    //     chunk_text: allSplits[index].pageContent,
    //   });

    // }

    // const pcIndex = pc.index("INDEX_NAME", "INDEX_HOST").namespace("example-namespace");

    if (!project.collectionName) {
      throw new Error("no collection name found");
    }
    const vectorStore = await getVectorStore(project.collectionName);

    await vectorStore.addDocuments(allSplits);

    // const pcIndex = pcClient.Index(project.collectionName, ENV.PINECONE_HOST);

    // console.log("pcIndex: ", pcIndex);
    //  await pcClient.({
    //    name: collectionName,
    //    cloud: "aws",
    //    region: "us-east-1",
    //    embed: {
    //      model: "multilingual-e5-large",
    //      fieldMap: { text: "chunk_text" },
    //    },
    //    waitUntilReady: true,
    //  });

    // Index chunks
    // await vectorStore.addDocuments(allSplits);

    // pcIndex.upsertRecords(pcRecords);

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
