import { DocCompass } from "./DocCompass";

export function LogoWithText() {
  return (
    <div className="text-pompadour/80 flex items-baseline">
      <div className="hidden md:block">
        <DocCompass size={30} />
      </div>
      <div className="md:hidden">
        <DocCompass size={23} />
      </div>
      <div className="pl-1 text-2xl font-stretch-50% md:pl-2 md:text-4xl">
        Doc Scout
      </div>
    </div>
  );
}
