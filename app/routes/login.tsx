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
import { ENV } from "~/.server/ENV";
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
import { Label } from "~/components/ui/Label";
import { GOOGLE_DRIVE_SCOPES } from "~/config/google";
import { STYTCH_GOOGLE_START } from "~/config/stytch";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { LINK_STYLES } from "~/styles/links";
import type { ServerResponse } from "~/types/server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnon({ request });

  const params = new URL(request.url).searchParams;
  const error = params.get(KEYS.error);

  const vercelEnv = process.env.VERCEL_ENV;
  console.info("vercelEnv: ", vercelEnv);
  const previewUrl =
    vercelEnv === "preview" ? process.env.VERCEL_URL : undefined;
  console.info("previewUrl: ", previewUrl);

  const stytchGoogleAuthStart = new URL(STYTCH_GOOGLE_START);
  stytchGoogleAuthStart.searchParams.set(
    KEYS.public_token,
    ENV.STYTCH_PUBLIC_TOKEN,
  );
  stytchGoogleAuthStart.searchParams.set(
    KEYS.custom_scopes,
    GOOGLE_DRIVE_SCOPES,
  );

  if (previewUrl) {
    stytchGoogleAuthStart.searchParams.set(KEYS.google_state, previewUrl);
  }
  return {
    error,
    googleAuthStartUrl: stytchGoogleAuthStart.href,
    // previewUrl, // generated preview url, if found
    // stytchPublicToken: ENV.STYTCH_PUBLIC_TOKEN,
    title: "Sign In",
  };
}
export default function LoginRoute() {
  const { error, googleAuthStartUrl, title } = useLoaderData<typeof loader>();

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
        <div className="bg-success absolute inset-x-0 top-12 z-10 my-4 rounded p-2 text-center">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <div className="flex h-2/3 flex-col items-center justify-center">
        <div className="mb-4">
          <PageTitle title={title} />
        </div>
        <div>
          <a href={googleAuthStartUrl}>Google login</a>
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
              type="email"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="block w-full min-w-72 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="email@example.com"
              required
            />
          </div>
          <ActionButton type="submit" disabled={nameValue.trim() === ""}>
            {navigation.state === "submitting" ? "Loading..." : "Continue"}
          </ActionButton>
        </Form>
        <div className="pt-4 text-sm">
          Don&apos;t have an account?{" "}
          <a className={LINK_STYLES} href="https://forms.gle/zCJqHCCSBgyrN8EB6">
            Request access
          </a>
          .
        </div>
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
