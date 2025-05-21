import { useState } from "react";
import {
  type ActionFunctionArgs,
  Form,
  useActionData,
  useNavigation,
} from "react-router";
import { stytchClient } from "~/.server/stytch/client";
import { upsertUser } from "~/.server/users/upsertUser";
import { getDomainHost } from "~/.server/utils/getDomainHost";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";

export function meta() {
  return [{ title: "Login" }];
}

// TODO: add a handler for if no user exists in the db

export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [nameValue, setNameValue] = useState("");

  // const submitDisabled =
  //   navigation.state === "submitting" ||
  //   nameValue.trim() === "" ||
  //   selectedFiles.length === 0;

  return (
    <div>
      {actionData?.email && (
        <div className="my-4 p-2 rounded bg-amber-200">
          Please check the inbox for {actionData.email}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <Form method="POST" className="flex flex-col gap-6">
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

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
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

    const user = await upsertUser({ stytchId: res.user_id });
    console.info("upserted user: ", user);

    return { email, ok: true };
  } catch (error) {
    console.error("Collection creation error: ", error);
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
