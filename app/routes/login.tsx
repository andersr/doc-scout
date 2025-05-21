import { useState } from "react";
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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";

export function meta() {
  return [{ title: "Login" }];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const error = params.get(PARAMS.ERROR);

  return {
    error,
  };
}
export default function LoginRoute() {
  const { error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  return (
    <div>
      {error && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {INTENTIONALLY_GENERIC_ERROR_MESSAGE}
        </div>
      )}
      {actionData?.email && (
        <div className="my-4 rounded bg-amber-200 p-2">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      <Form
        method="POST"
        className="flex flex-col gap-6"
        action={appRoutes("/login")}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={PARAMS.COLLECTION_NAME}>Email</Label>
          <Input
            id={PARAMS.EMAIL}
            name={PARAMS.EMAIL}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <Button type="submit">
          {navigation.state === "submitting" ? "Sending..." : "Login"}
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

export async function action({ request }: ActionFunctionArgs) {
  // const params = new URL(request.url).searchParams;
  // const error = params.get(PARAMS.ERROR);

  try {
    const formData = await request.formData();
    const email = formData.get(PARAMS.EMAIL)?.toString();

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
