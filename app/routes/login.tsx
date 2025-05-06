import { useState } from "react";
import { data, Form, useActionData, useNavigation } from "react-router";
import { twMerge } from "tailwind-merge";
import { createSession } from "~/.server/sessions/createSession";
import { requireAnon } from "~/.server/sessions/requireAnon";
import { upsertUser } from "~/.server/users/upsertUser";
import { prisma } from "~/lib/prisma";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { Route } from "./+types/login";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnon(request);

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  await requireAnon(request);

  const formPayload = Object.fromEntries(await request.formData());
  const emailFormData = formPayload[PARAMS.EMAIL];
  const email = emailFormData.toString().trim();

  try {
    const user = await upsertUser({
      email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    return createSession({
      publicId: user.publicId,
      // redirectTo: redirectTo || route("/"),
      remember: true,
      request,
    });
  } catch (error) {
    console.error("login error: ", error);
    return data({
      email: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

export default function LoginRoute() {
  // const { loginPageTitle, invalidCode, invalidLogin } =
  //   useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [emailValue, setEmailValue] = useState("");
  // const [confirmationMessage, setConfirmationMessage] = useState("");

  // useEffect(() => {
  //   if (actionData?.email) {
  //     setEmailValue("");
  //     setConfirmationMessage(
  //       `Login link sent. Please check the inbox for "${actionData?.email}"`,
  //     );
  //   }
  // }, [actionData]);

  // useEffect(() => {
  //   if (confirmationMessage && emailValue.trim() !== "") {
  //     setConfirmationMessage("");
  //   }
  // }, [confirmationMessage, emailValue]);

  const submitDisbled = navigation.state === "submitting";

  return (
    <>
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4">
        <div className="flex flex-col gap-6">
          <h1 className={twMerge("text-center")}>Sign In</h1>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 md:max-w-xs">
          {/* <googleFetcher.Form
            method="POST"
            action={route("/login/google/auth-url")}
          >
            <button
              className={twMerge(
                "flex h-12 w-full items-center justify-center gap-3 rounded border border-black p-2",
                HEADING_5,
              )}
            >
              <img
                src="/images/google-logo.png"
                alt="Google logo"
                className="size-[18px]"
              />
              {googleFetcher.state !== "idle"
                ? "Submitting..."
                : "Continue with Google"}
            </button>
          </googleFetcher.Form> */}
          <div className="flex h-6 items-center">
            <div className="flex h-px w-full items-center justify-center bg-grey-2">
              <span className="h-6 bg-white px-6 text-grey-3">Or</span>
            </div>
          </div>
          <Form
            method="POST"
            className="flex w-full flex-col items-end gap-3 md:items-center"
          >
            <div className="flex w-full max-w-md flex-col gap-1">
              <label htmlFor={"email"}>Email</label>
              <input
                type="email"
                name={PARAMS.EMAIL}
                placeholder="name@example.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="rounded-md border border-grey-2 bg-transparent p-3 text-base leading-normal placeholder:font-normal placeholder:text-grey-3"
                required
              />
            </div>
            <button
              type="submit"
              name="intent"
              value={PARAMS.EMAIL}
              disabled={submitDisbled}
              className={twMerge(
                "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full",
                submitDisbled ? "bg-grey-1 text-grey-3 cursor-wait" : "",
              )}
            >
              {submitDisbled ? "Sending..." : "Sign In"}
            </button>
          </Form>
          {actionData?.errorMessage && (
            <div className="mt-4 text-center font-semibold text-red-400">
              {actionData?.errorMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
