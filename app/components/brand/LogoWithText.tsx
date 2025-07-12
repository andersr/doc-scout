import { DocIcon } from "./DocIcon";

export function LogoWithText() {
  return (
    <div className="text-pompadour/70 flex items-baseline">
      <DocIcon size={30} />
      <div className="pl-3 text-4xl font-stretch-50% md:text-4xl">
        Doc Scout
      </div>
    </div>
  );
}
