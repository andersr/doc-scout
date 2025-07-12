import { DocIcon } from "./DocIcon";

export function Logo() {
  return (
    <div className="text-pompadour/70 flex items-baseline">
      <div className="hidden md:block">
        <DocIcon size={34} />
      </div>
      <div className="md:hidden">
        <DocIcon size={30} />
      </div>
    </div>
  );
}
