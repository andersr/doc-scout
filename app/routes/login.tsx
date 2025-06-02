import { useEffect, useState } from "react";
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { stytchClient } from "~/.server/stytch/client";
import { upsertUser } from "~/.server/users/upsertUser";
import { getDomainHost } from "~/.server/utils/getDomainHost";
import AppHeader from "~/components/AppHeader";
import { BaseLayout } from "~/components/BaseLayout";
import { PageTitle } from "~/components/page-title";
import { ActionButton } from "~/components/ui/ActionLink";
import { Label } from "~/components/ui/label";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";

export function meta() {
  return [{ title: "Login" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const error = params.get(KEYS.error);

  return {
    error,
  };
}
export default function LoginRoute() {
  const { error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  useEffect(() => {
    if (actionData?.ok && nameValue.trim() !== "") {
      setNameValue("");
    }
  }, [actionData?.ok, nameValue]);

  return (
    <BaseLayout className="relative">
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
          <PageTitle>Sign In</PageTitle>
        </div>
        <Form
          method="POST"
          className="flex flex-col gap-6"
          action={appRoutes("/login")}
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
            {navigation.state === "submitting" ? "Sending..." : "Sign In"}
          </ActionButton>
        </Form>

        {actionData?.errorMessage && (
          <div className="mt-4 text-center font-semibold text-red-400">
            {actionData.errorMessage}
          </div>
        )}
      </div>
    </BaseLayout>
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
