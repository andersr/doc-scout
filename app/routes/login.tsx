import { useState } from "react";
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { upsertUser } from "~/.server/models/users/upsertUser";
import getGoogleAuthStartUrl from "~/.server/services/oauth/getGoogleAuthStartUrl";
import { requireAnon } from "~/.server/services/sessions/requireAnon";
import { getDomainHost } from "~/.server/utils/getDomainHost";
import getFormData from "~/.server/utils/getFormData";
import { isAllowedUser } from "~/.server/utils/isAllowedUser";
import redirectWithDomainHost from "~/.server/utils/redirectWithDomainHost";

import { serverError } from "~/.server/utils/serverError";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { Logo } from "~/components/brand/Logo";
import { Footer } from "~/components/layout/Footer";
import { PageTitle } from "~/components/layout/PageTitle";
import { ActionButton } from "~/components/ui/buttons/ActionButton";
import { Label } from "~/components/ui/Label";
import { APP_NAME } from "~/config/app";
import { LOGIN_TITLE } from "~/config/titles";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { LINK_STYLES } from "~/styles/links";
import type { ServerResponse } from "~/types/server";

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .refine((e) => e.toLowerCase()),
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnon({ request });

  const params = new URL(request.url).searchParams;
  const error = params.get(KEYS.error);

  return {
    error,
    googleAuthStartUrl: getGoogleAuthStartUrl(),
  };
}
export default function LoginRoute() {
  const { error, googleAuthStartUrl } = useLoaderData<typeof loader>();

  const actionData = useActionData<ServerResponse & { email: string }>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  const errors = actionData?.errors
    ? [...actionData.errors]
    : error
      ? [INTENTIONALLY_GENERIC_ERROR_MESSAGE]
      : [];
  return (
    <div className="mx-auto flex h-full flex-col px-4">
      <title>{`${APP_NAME} - ${LOGIN_TITLE}`}</title>
      <header>
        <div className="flex flex-row items-center justify-between py-4 pr-3 pl-2 md:py-6">
          <Link to={appRoutes("/")}>
            <Logo
              withText
              customStyles="text-pompadour/80"
              customOpacity={0.8}
            />
          </Link>
        </div>
      </header>
      {actionData?.email && (
        <div className="bg-success absolute inset-x-0 top-12 z-10 my-4 rounded p-2 text-center">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <div className="flex-1">
        <div className="mt-16 text-center">
          <PageTitle centered customStyles="text-5xl">
            {LOGIN_TITLE}
          </PageTitle>
        </div>
        <div className="mx-auto flex max-w-[325px] flex-col gap-6 pt-12">
          <div>
            <a
              className={twMerge(
                "flex h-12 w-full items-center justify-center gap-3 rounded border border-black p-2",
                "text-base leading-normal font-medium",
              )}
              href={googleAuthStartUrl}
            >
              <img
                src="/images/google-logo.png"
                alt="Google logo"
                className="size-[18px]"
              />
              Continue with Google
            </a>
          </div>
          <div className="pt-1">
            <hr className="border-top-1 border-slate-300" />
          </div>
          {errors.map((e) => (
            <div key={e} className="text-danger py-2 text-center">
              {e}
            </div>
          ))}
          <Form
            method="POST"
            className="flex flex-col gap-4"
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
          <div className="text-sm">
            Don&apos;t have an account?{" "}
            <a
              className={LINK_STYLES}
              href="https://forms.gle/zCJqHCCSBgyrN8EB6"
            >
              Request access
            </a>
            .
          </div>
        </div>
      </div>
      <div className="pt-4 pb-6">
        <Footer />
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await getFormData({ request });
    const data = loginSchema.parse(formData);

    if (!isAllowedUser(data.email)) {
      return redirectWithDomainHost({
        request,
        route: appRoutes("/request-access", {
          email: data.email,
        }),
      });
    }

    const isPreviewEnv = process.env.VERCEL_ENV === "preview";
    const redirectUrlIfPreview = isPreviewEnv
      ? `${getDomainHost({ request, withProtocol: true })}/authenticate`
      : undefined;

    const res = await stytchClient.magicLinks.email.loginOrCreate({
      email: data.email,
      login_magic_link_url: redirectUrlIfPreview,
      signup_magic_link_url: redirectUrlIfPreview,
    });

    if (!res || !res.user_id) {
      throw new Error("bad stytch response");
    }

    await upsertUser({ stytchId: res.user_id });

    return { email: data.email, errors: null, ok: true };
  } catch (error) {
    return serverError(error);
  }
}
