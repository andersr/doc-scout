import { useState } from "react";
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { uploadJsonToBucket } from "~/.server/aws/uploadJsonToBucket";
import { fcApp } from "~/.server/firecrawl/fcApp";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireParam } from "~/.server/utils/requireParam";
import { slugify } from "~/.server/utils/slugify";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import {
  INTENTIONALLY_GENERIC_ERROR_MESSAGE,
  INVALID_URL_ERROR,
} from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id.sources.new";

const SECTION_NAME = "Add API Key";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta() {
  return [{ title: SECTION_NAME }, { name: "description", content: "" }];
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

  return { project: projectMembership.project };
}
export default function NewSource() {
  // const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [inputValue, setInputValue] = useState("");

  const submitDisabled = navigation.state === "submitting";

  return (
    <div>
      <Form method="POST" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={PARAMS.NAME}>Name</label>
          <input
            id={PARAMS.NAME}
            name={PARAMS.NAME}
            placeholder="https://example.com"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded-md border border-grey-2 bg-transparent p-3 text-base leading-normal placeholder:font-normal placeholder:text-grey-3"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitDisabled}
          className={twMerge(
            "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full border cursor-pointer",
            submitDisabled ? "bg-grey-1 text-grey-3 cursor-wait" : "",
          )}
        >
          {submitDisabled ? "Adding..." : "Add"}
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

    const project = projectMembership.project;

    if (!project?.id) {
      throw new Error("No project id found or current user is not a member");
    }

    const formPayload = Object.fromEntries(await request.formData());
    // TODO: add name param
    const urlFormData = formPayload[PARAMS.URL];
    const url = urlFormData.toString().trim();

    // TODO: get name from title value instead
    // const nameFormData = formPayload[PARAMS.NAME];
    // const name = nameFormData.toString().trim();

    // Validate URL
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return data<ActionData>({
        url,
        errorMessage: INVALID_URL_ERROR,
        ok: false,
      });
    }

    // Scrape a website
    const scrapeResponse = await fcApp.scrapeUrl(url, {
      formats: ["markdown", "html"],
    });
    // console.log("scrapeResponse: ", scrapeResponse);

    if (!scrapeResponse.success) {
      throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
    }

    let name = scrapeResponse?.metadata?.title;
    if (!name) {
      console.warn("no page title found");
      name = url;
    }

    const sourcePublicId = generateId();

    // console.log(scrapeResponse);
    // generate an id and add to s3 key

    // Generate a unique filename for S3
    // projects/<id>-nameSlug/sources/<id>-nameSlug.json
    const timestamp = new Date().toISOString();
    // const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, "_");
    // const s3Key = `scrapes/${slugify(url)}_${slugify(timestamp, {
    //   lower: false,
    // })}.json`;

    const storagePath = `projects/${projectPublicId}/sources/${sourcePublicId}/${slugify(
      url,
    )}_${slugify(timestamp, {
      lower: false,
    })}.json`;

    // console.log("s3Key: ", s3Key);
    // Upload the scrape response to S3
    await uploadJsonToBucket(storagePath, scrapeResponse);

    await prisma.source.create({
      data: {
        name,
        publicId: sourcePublicId,
        createdAt: new Date(),
        url,
        storagePath,
        project: {
          connect: {
            id: project.id,
          },
        },
      },
    });

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
    return redirect(appRoutes("/projects/:id", { id: project.publicId }));
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      url: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}
