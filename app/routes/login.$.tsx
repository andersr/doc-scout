import { SignIn } from "@clerk/react-router";
import { appRoutes } from "~/shared/appRoutes";

export function meta() {
  return [{ title: "Sign In" }];
}

// TODO: add a handler for if no user exists in the db

export default function LoginRoute() {
  return <SignIn fallbackRedirectUrl={appRoutes("/")} />;
}
