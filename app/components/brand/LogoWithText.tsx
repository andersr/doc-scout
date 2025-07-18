import { DocCompass } from "./DocCompass";

export function LogoWithText() {
  return (
    <div className="text-pompadour/60 flex items-baseline">
      <div className="hidden md:block">
        <DocCompass size={24} />
      </div>
      <div className="md:hidden">
        <DocCompass size={23} />
      </div>
      <div className="pl-2 text-2xl font-stretch-50% md:text-3xl">
        Doc Scout
      </div>
    </div>
  );
}
