import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router";
import { loginAction } from "~/.server/actions/loginAction";
import { otpAction } from "~/.server/actions/otpAction";
import { requireAnon } from "~/.server/sessions/requireAnon";
import { LoginForm } from "~/components/LoginForm";
import { OtpForm } from "~/components/OtpForm";
import { PageTitle } from "~/components/PageTitle";
import { INTENTS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/login";

const PAGE_TITLE = "Sign In";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnon(request);

  return {};
}

export default function LoginRoute() {
  // const { loginPageTitle, invalidCode, invalidLogin } =
  //   useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const pendingUI = useNavigation();

  const [loginView, setLoginView] = useState<"EMAIL" | "OTP">("EMAIL");
  // const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    if (loginView === "EMAIL" && actionData?.email) {
      setLoginView("OTP");
      // setEmailValue("");
      // setConfirmationMessage(
      //   `Login link sent. Please check the inbox for "${actionData?.email}"`,
      // );
    }
  }, [actionData]);

  // useEffect(() => {
  //   if (confirmationMessage && emailValue.trim() !== "") {
  //     setConfirmationMessage("");
  //   }
  // }, [confirmationMessage, emailValue]);

  // const submitDisbled = pendingUI.state === "submitting";

  // const {
  //   handleSubmit: handleLoginSubmit,
  //   formState: { errors, isValid },
  //   register: registerLogin,
  // } = useRemixForm<LoginFormData>({
  //   mode: "onSubmit",
  //   resolver: loginResolver,
  // });

  // const {
  //   handleSubmit: handleOtpSubmit,
  //   formState: { errors, isValid },
  //   register: registerOtp,
  // } = useRemixForm<OtpFormData>({
  //   mode: "onSubmit",
  //   resolver: otpResolver,
  // });

  return (
    <>
      {/* {confirmationMessage && <SuccessBanner message={confirmationMessage} />} */}
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4">
        <div className="flex flex-col gap-6">
          <PageTitle>
            {loginView === "EMAIL" ? "Sign In" : "Enter code"}
          </PageTitle>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 md:max-w-xs">
          {loginView === "EMAIL" && <LoginForm />}
          {loginView === "OTP" && actionData?.email && (
            <OtpForm email={actionData.email} />
          )}
        </div>
      </div>
    </>
  );
}

// async function handleActionIntent({
//   request,
//   handlers,
// }: {
//   request: Request;
//   handlers: Record<string, () => Promise<string>>;
// }) {
//   const formPayload = Object.fromEntries(await request.formData());
//   console.log("formPayload: ", formPayload);
//   const intent = formPayload["intent"].toString();
//   console.log("intent: ", intent);

//   if (handlers[intent]) {
//     console.log("handler: ", handlers[intent]);
//     return await handlers[intent]();
//   }

//   return intent;
// }

export async function action({ request }: Route.ActionArgs) {
  // TODO: instead of cloning, get the form data here, and pass it in, then use validateFormData in each action
  const clone = request.clone();
  const formPayload = Object.fromEntries(await clone.formData());
  const intent = formPayload["intent"].toString();

  // TODO: both these intents need a shared return type(?)
  if (intent === INTENTS.LOGIN) {
    return await loginAction({ request });
  }
  if (intent === INTENTS.OTP) {
    return await otpAction({ request });
  }

  // throw error, no matching intent

  return { email: "" };
}

// try {
// const {
//   errors,
//   data: formData,
//   receivedValues: defaultValues,
// } = await getValidatedFormData<FormData>(request, resolver);

// if (errors) {
//   return data({
//     email: "",
//     errorMessage: "",
//     ok: false,
//     defaultValues,
//     errors,
//   });
// }

// const { user, newUser } = await upsertUser({ email: formData.email });

// const { otp, verificationConfig } = await getTOTP();

// const target = user.email;
// const type = "email";

// const verificationData = {
//   algorithm: verificationConfig.algorithm,
//   digits: verificationConfig.digits,
//   email: user.email,
//   expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
//   // hash: signature,
//   period: verificationConfig.period,
//   secret: verificationConfig.secret,
//   target,
//   type,
// };

// await prisma.verification.upsert({
//   create: verificationData,
//   update: verificationData,
//   where: { target_type: { target, type } },
// });

// const emailGreeting = newUser ? "Welcome to" : "Sign in to";
// const domainHost = getDomainHost({ request });

// const title = `${emailGreeting} Muni Admin (${domainHost})`;

// await sendEmail({
//   config: {
//     textLines: [
//       `Your OTP: ${otp}`,
//       "If you did not request this email, you can safely ignore it.",
//     ],
//     title,
//   },
//   to: user.email,
// });

// return data({
//   email: user.email,
//   errorMessage: "",
//   ok: true,
// });
// } catch (error) {
//   console.error("login error: ", error);
//   return data({
//     email: "",
//     errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
//     ok: false,
//   });
// }
