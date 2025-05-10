import type { Prisma } from "@prisma/client";
import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import slugify from "slugify";
import { uploadJsonToBucket } from "~/.server/aws/uploadJsonToBucket";
import { fcApp } from "~/.server/firecrawl/fcApp";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireParam } from "~/.server/utils/requireParam";
import { stripTrailingSlash } from "~/.server/utils/stripTrailingSlash";
import { Button } from "~/components/ui/button";
import { URLS_INPUT_PLACEHOLDER } from "~/config/inputs";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id.sources.new";

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
export const handle: RouteData = {
  pageTitle: "Add Sources",
};

export function meta() {
  return [{ title: "Add source" }, { name: "description", content: "" }];
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

  // TODO: use remix hook form
  const [inputValue, setInputValue] = useState("");

  const submitDisabled = navigation.state === "submitting";
  // TODO: validate comma-separated URLs on blur
  // TODO: display - please wait message if item count is high
  return (
    <div>
      <Form method="POST" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="url">URLs (comma-separated)</label>
          <textarea
            name={PARAMS.URLS}
            value={inputValue}
            placeholder={URLS_INPUT_PLACEHOLDER}
            onChange={(e) => setInputValue(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <Button
          type="submit"
          disabled={inputValue.trim() === "" || submitDisabled}
        >
          {submitDisabled ? "Adding..." : "Add"}
        </Button>
      </Form>

      {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )}
    </div>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const user = await requireUser({ request });

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
    const urlFormData = formPayload[PARAMS.URLS];
    const urlsNoNewLines = urlFormData
      .toString()
      .trim()
      .replace(/(\r\n|\n|\r)/gm, "");

    const urlsFormatted = urlsNoNewLines
      .toString()
      .trim()
      .split(",")
      .map((u) => stripTrailingSlash(u));

    const urls = [...new Set(urlsFormatted)];

    if (urls.length === 0) {
      console.warn("no urls");
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        statusText: "No urls returned",
      });
    }

    for (let index = 0; index < urls.length; index++) {
      if (!URL_REGEX.test(urls[index])) {
        console.warn("invalid url");
        return new Response(JSON.stringify({ ok: false }), {
          status: 400,
          statusText: `Invalid url: ${urls[index]}`,
        });
      }
    }

    const existingSources = project.sources.filter(
      (s) => s.url && urls.includes(s.url),
    );

    if (existingSources.length > 0) {
      throw new Error(
        `Some URLs have already been added: ${existingSources.map((s) => s.url).join(", ")}`,
      );
    }

    // TODO: check first if data for url already exists in storage: query s3 bucket for matching source public id in this project

    const scrapeBatchResponse = await fcApp.batchScrapeUrls(urls, {
      formats: ["markdown", "html"],
    });

    if (!scrapeBatchResponse.success) {
      throw new Error(`Failed to scrape: ${scrapeBatchResponse.error}`);
    }
    // console.log("scrapeBatchResponse: ", scrapeBatchResponse?.data[0].metadata);

    const sourcesInput: Prisma.SourceCreateManyInput[] = [];

    for (let index = 0; index < scrapeBatchResponse.data.length; index++) {
      let name = scrapeBatchResponse.data[index].metadata?.title;
      if (!name) {
        console.warn(
          `no page title found for: ${scrapeBatchResponse.data[index].metadata}`,
        );
        name = "untitled"; // TODO: set using metadata values
      }
      const url = scrapeBatchResponse.data[index].metadata?.url;
      if (!url) {
        console.warn(
          `no url found for: ${scrapeBatchResponse.data[index].metadata}`,
        );
        continue;
      }
      const sourcePublicId = generateId();
      const timestamp = new Date().toISOString();

      // TODO: strip protocol from url
      const storagePath = `projects/${projectPublicId}/sources/${sourcePublicId}/${slugify(
        url,
      )}_${slugify(timestamp, {
        lower: false,
      })}.json`;

      sourcesInput.push({
        name,
        publicId: sourcePublicId,
        createdAt: new Date(),
        url,
        storagePath,
        projectId: project.id,
      });

      await uploadJsonToBucket(storagePath, scrapeBatchResponse.data[index]);
    }

    await prisma.source.createMany({
      data: sourcesInput,
    });

    return redirect(appRoutes("/projects/:id", { id: project.publicId }));
  } catch (error) {
    // TODO: fix this - should not be using 'data' which will always return a 200
    console.error("URL submission error: ", error);
    // return null;
    return {
      ok: false,
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
    };
  }
}
