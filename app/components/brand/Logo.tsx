import { DocCompass } from "./DocCompass";

export function Logo() {
  return (
    <div className="text-pompadour/70 flex items-baseline">
      <div className="hidden md:block">
        <DocCompass size={40} />
      </div>
      <div className="md:hidden">
        <DocCompass size={30} />
      </div>
    </div>
  );
}
