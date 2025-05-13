import { SignUp } from "@clerk/react-router";
import { appRoutes } from "~/shared/appRoutes";

export function meta() {
  return [{ title: "Sign Up" }];
}

export default function LoginRoute() {
  return <SignUp fallbackRedirectUrl={appRoutes("/")} />;
}
