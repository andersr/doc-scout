import { UserNav, type UserNavProps } from "~/components/UserNav";

export function MainLayout({
  currentUser,
  children,
}: {
  children: React.ReactNode;
} & UserNavProps) {
  return (
    <div>
      <UserNav currentUser={currentUser} />
      {children}
    </div>
  );
}
