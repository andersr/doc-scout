import { twMerge } from "tailwind-merge";
import { DocCompass } from "./DocCompass";

export function Logo({
  customStyles,
  opacity,
  withText,
}: {
  customStyles?: string;
  opacity?: number;
  withText?: boolean;
}) {
  return (
    <div
      className={twMerge("text-pompadour/50 flex items-baseline", customStyles)}
    >
      <div className="hidden md:block">
        <DocCompass opacity={opacity} size={26} />
      </div>
      <div className="px-2 md:hidden">
        <DocCompass opacity={opacity} size={30} />
      </div>
      {withText && (
        <div className="text-3xl font-stretch-50% md:pl-2 md:text-3xl">
          Doc Scout
        </div>
      )}
    </div>
  );
}
