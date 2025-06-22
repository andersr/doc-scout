import { useState } from "react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { upsertUser } from "~/.server/models/users/upsertUser";
import { requireAnon } from "~/.server/services/sessions/requireAnon";

import { getDomainHost } from "~/.server/utils/getDomainHost";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { AppContainer } from "~/components/AppContainer";
import AppHeader from "~/components/AppHeader";
import { PageTitle } from "~/components/PageTitle";
import { ActionButton } from "~/components/ui/ActionButton";
import { Label } from "~/components/ui/label";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnon({ request });

  const params = new URL(request.url).searchParams;
  const error = params.get(KEYS.error);

  return {
    error,
    title: "Sign In",
  };
}
export default function LoginRoute() {
  const { error, title } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  return (
    <AppContainer className="relative">
      <AppHeader />
      {actionData?.email && (
        <div className="bg-success absolute inset-x-0 top-12 z-10 my-4 rounded p-2">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <div className="flex h-2/3 flex-col items-center justify-center">
        {error && (
          <div className="mt-4 text-center font-semibold text-red-400">
            {INTENTIONALLY_GENERIC_ERROR_MESSAGE}
          </div>
        )}

        <div className="mb-4">
          <PageTitle title={title} />
        </div>
        <Form
          method="POST"
          className="flex flex-col gap-6"
          onSubmit={() => setNameValue("")}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={KEYS.email}>Email</Label>
            <input
              id={KEYS.email}
              name={KEYS.email}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="block w-full min-w-72 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="email@example.com"
              required
            />
          </div>
          <ActionButton type="submit">
            {navigation.state === "submitting" ? "Loading..." : "Continue"}
          </ActionButton>
        </Form>

        {actionData?.errorMessage && (
          <div className="mt-4 text-center font-semibold text-red-400">
            {actionData.errorMessage}
          </div>
        )}
      </div>
    </AppContainer>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get(KEYS.email)?.toString();

    if (!email || email.trim() === "") {
      return {
        errorMessage: "Email is required",
        ok: false,
      };
    }

    const isPreviewEnv = process.env.VERCEL_ENV === "preview";
    const redirectUrl = isPreviewEnv
      ? `${getDomainHost({ request, withProtocol: true })}/authenticate`
      : undefined;

    const res = await stytchClient.magicLinks.email.loginOrCreate({
      email,
      login_magic_link_url: redirectUrl,
      signup_magic_link_url: redirectUrl,
    });

    if (!res || !res.user_id) {
      throw new Error("bad stytch response");
    }

    await upsertUser({ stytchId: res.user_id });

    return { email, ok: true };
  } catch (error) {
    console.error("error: ", error);
    return {
      email: null,
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    };
  }
}
