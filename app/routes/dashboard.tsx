import { useState } from "react";
import {
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { requireUser } from "~/.server/sessions/requireUser";
import { getClientUser } from "~/.server/utils/getClientUser";
import { MainLayout } from "~/components/MainLayout";
import {
  INTENTIONALLY_GENERIC_ERROR_MESSAGE,
  INVALID_URL_ERROR,
} from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { Route } from "./+types/dashboard";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "New React Router App" },
//     { name: "description", content: "Welcome to React Router!" },
//   ];
// }

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const internalUser = await requireUser({ request });

    return { currentUser: getClientUser(internalUser) };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

// Define a consistent return type for the action
type ActionData = {
  url: string;
  errorMessage?: string;
  successMessage?: string;
  ok: boolean;
};

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

    // For now, just return success (we'll ignore Firecrawl functionality)
    return data<ActionData>({
      url,
      successMessage: "URL submitted successfully!",
      ok: true,
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

export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [urlValue, setUrlValue] = useState("");

  const submitDisabled = navigation.state === "submitting";

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
                "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full",
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
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
