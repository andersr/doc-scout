import { Outlet } from "react-router";
import { AppNav } from "~/components/AppNav";
// import { UserNav } from "~/components/UserNav";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/react-router";

// import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Dashboard" }, { name: "description", content: "" }];
}

// export async function loader(args: Route.LoaderArgs) {
//   const currentUser = await requireUser(args);

//   return { currentUser };
// }

export default function AuthLayout() {
  // const { currentUser } = useLoaderData<typeof loader>();

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-2">
        <AppNav />
        {/* <UserNav currentUser={currentUser} /> */}
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
