import { useState } from "react";
import {
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { uploadJsonToS3 } from "~/.server/aws/uploadToS3";
import { fcApp } from "~/.server/firecrawl/fcApp";
import { getClientUser } from "~/.server/users/getClientUser";
import { slugify } from "~/.server/utils/slugify";
import { MainLayout } from "~/components/MainLayout";
import {
  INTENTIONALLY_GENERIC_ERROR_MESSAGE,
  INVALID_URL_ERROR,
} from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { ActionData } from "~/types/actionData";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });

    return { currentUser };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

// Define a consistent return type for the action
// type ActionData = {
//   url: string;
//   errorMessage?: string;
//   successMessage?: string;
//   ok: boolean;
//   s3Key?: string;
// };

export async function action({ request }: Route.ActionArgs) {
  try {
    const formPayload = Object.fromEntries(await request.formData());
    const urlFormData = formPayload[PARAMS.URL];
    const url = urlFormData.toString().trim();

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

    if (!scrapeResponse.success) {
      throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
    }

    // console.log(scrapeResponse);

    // Generate a unique filename for S3
    const timestamp = new Date().toISOString();
    // const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, "_");
    const s3Key = `scrapes/${slugify(url)}_${slugify(timestamp, {
      lower: false,
    })}.json`;

    // Upload the scrape response to S3
    await uploadJsonToS3(s3Key, scrapeResponse);

    // add to vector db: https://qdrant.tech/documentation/examples/rag-chatbot-scaleway/ https://js.langchain.com/docs/introduction/ https://www.npmjs.com/package/@qdrant/qdrant-js https://js.langchain.com/docs/tutorials/rag
    // will work for a single file, but not ideal for batches

    // update so that generating the chunks and embeddings is a separate step, which reads from the s3 files

    // Return success with the S3 key
    return data<ActionData>({
      url,
      successMessage: "URL submitted and saved to S3 successfully!",
      ok: true,
      s3Key,
    });
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      url: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

export default function Scrape() {
  const { currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [urlValue, setUrlValue] = useState("");

  const submitDisabled = navigation.state === "submitting";

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">Scrape</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submit URL</h2>

          <Form method="POST" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="url">URL</label>
              <input
                type="url"
                id="url"
                name={PARAMS.URL}
                placeholder="https://example.com"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="rounded-md border border-grey-2 bg-transparent p-3 text-base leading-normal placeholder:font-normal placeholder:text-grey-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className={twMerge(
                "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full border cursor-pointer",
                submitDisabled ? "bg-grey-1 text-grey-3 cursor-wait" : ""
              )}
            >
              {submitDisabled ? "Submitting..." : "Submit URL"}
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
