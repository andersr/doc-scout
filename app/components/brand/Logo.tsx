import { useState } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { DocCompass } from "./DocCompass";

const DEFAULT_OPACITY = 0.5;
const HOVER_OPACITY = 1;

const LINK_STYLES = "flex items-baseline text-pompadour/50 ";

interface LogoProps {
  customOpacity?: number;
  customStyles?: string;
  shouldLink?: boolean;
  to?: string;
  withText?: boolean;
}

export function Logo({
  customOpacity,
  customStyles,
  shouldLink,
  to,
  withText,
}: LogoProps) {
  return shouldLink && to ? (
    <Link
      className={twMerge(LINK_STYLES, "hover:text-pompadour", customStyles)}
      to={to}
    >
      <LogoParts withText={withText} />
    </Link>
  ) : (
    <div className={twMerge(LINK_STYLES, customStyles)}>
      <LogoParts withText={withText} customOpacity={customOpacity} />
    </div>
  );
}

function LogoParts({ customOpacity, withText }: LogoProps) {
  const [opacity, setOpacity] = useState(DEFAULT_OPACITY);
  return (
    <div
      className="flex items-baseline"
      onMouseEnter={() => setOpacity(HOVER_OPACITY)}
      onMouseLeave={() => setOpacity(DEFAULT_OPACITY)}
    >
      <div className="hidden md:block">
        <DocCompass opacity={customOpacity ?? opacity} size={26} />
      </div>
      <div className="px-2 md:hidden">
        <DocCompass opacity={customOpacity ?? opacity} size={30} />
      </div>
      {withText && (
        <div className="text-3xl font-stretch-50% md:pl-2 md:text-3xl">
          Doc Scout
        </div>
      )}
    </div>
  );
}
