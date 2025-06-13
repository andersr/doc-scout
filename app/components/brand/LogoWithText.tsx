import { Logo } from "./Logo";

export function LogoWithText() {
  return (
    <div className="text-pompadour/70 flex items-baseline">
      <Logo size={28} />
      <div className="pl-2 text-3xl font-stretch-50% md:pl-3 md:text-4xl">
        Doc Scout
      </div>
    </div>
  );
}
