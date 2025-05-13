// import { UserNav, type UserNavProps } from "~/components/UserNav";
import { AppNav } from "./AppNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <AppNav />
        {/* <UserNav currentUser={currentUser} /> */}
      </div>
      <main className="py-4">{children}</main>
    </div>
  );
}
