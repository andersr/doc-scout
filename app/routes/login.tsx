import { useState } from "react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { upsertUser } from "~/.server/models/users/upsertUser";
import { requireAnon } from "~/.server/services/sessions/requireAnon";
import { getDomainHost } from "~/.server/utils/getDomainHost";

import { isAllowedUser } from "~/.server/utils/isAllowedUser";
import { serverError } from "~/.server/utils/serverError";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { AppContainer } from "~/components/layout/AppContainer";
import AppHeader from "~/components/layout/AppHeader";
import { PageTitle } from "~/components/layout/PageTitle";
import { ActionButton } from "~/components/ui/buttons/ActionButton";
import { Label } from "~/components/ui/LabelTmp";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ServerResponse } from "~/types/server";

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
  const actionData = useActionData<ServerResponse & { email: string }>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  const errors = actionData?.errors
    ? [...actionData.errors]
    : error
      ? [INTENTIONALLY_GENERIC_ERROR_MESSAGE]
      : [];

  return (
    <AppContainer className="relative">
      <AppHeader />
      {actionData?.email && (
        <div className="bg-success absolute inset-x-0 top-12 z-10 my-4 rounded p-2">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <div className="flex h-2/3 flex-col items-center justify-center">
        <div className="mb-4">
          <PageTitle title={title} />
        </div>
        {errors.map((e) => (
          <div key={e} className="text-danger py-2 text-center">
            {e}
          </div>
        ))}
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

    const normalizedEmail = email.toLowerCase();

    const isAllowed = isAllowedUser(normalizedEmail);

    if (!isAllowed) {
      return redirect(
        `${getDomainHost({ request, withProtocol: true })}${appRoutes(
          "/request-access",
          {
            email: normalizedEmail,
          },
        )}`,
      );
    }

    const isPreviewEnv = process.env.VERCEL_ENV === "preview";
    const redirectUrlIfPreview = isPreviewEnv
      ? `${getDomainHost({ request, withProtocol: true })}/authenticate`
      : undefined;

    const res = await stytchClient.magicLinks.email.loginOrCreate({
      email: normalizedEmail,
      login_magic_link_url: redirectUrlIfPreview,
      signup_magic_link_url: redirectUrlIfPreview,
    });

    if (!res || !res.user_id) {
      throw new Error("bad stytch response");
    }

    await upsertUser({ stytchId: res.user_id });

    return { email, errors: null, ok: true };
  } catch (error) {
    return serverError(error);
  }
}
