import { Outlet } from "react-router";
import { AppNav } from "~/components/AppNav";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/react-router";
import { requireUser } from "~/.server/users";
import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Dashboard" }, { name: "description", content: "" }];
}

export async function loader(args: Route.LoaderArgs) {
  await requireUser(args);

  return {};
}

export default function AuthLayout() {
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-2">
        <AppNav />
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <main className="py-4 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
