import { UserNav, type UserNavProps } from "~/components/UserNav";
import { AppNav } from "./AppNav";

export function MainLayout({
  currentUser,
  children,
}: {
  children: React.ReactNode;
} & UserNavProps) {
  return (
    <div>
      <UserNav currentUser={currentUser} />
      <AppNav />
      {children}
    </div>
  );
}
