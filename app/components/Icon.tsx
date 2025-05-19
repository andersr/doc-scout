import { twMerge } from "tailwind-merge";
import { DEFAULT_ICON_SIZE } from "~/config/icons";

export interface IconProps {
  ariaLabel?: string;
  customStyles?: string;
  fontSize?: string;
  name: string;
}

export function Icon({ ariaLabel, customStyles, fontSize, name }: IconProps) {
  return (
    <span
      style={{
        fontSize: fontSize || DEFAULT_ICON_SIZE,
      }}
      aria-label={ariaLabel}
      className={twMerge(
        "material-symbols-outlined",

        customStyles,
      )}
      dangerouslySetInnerHTML={{ __html: name }}
    />
  );
}
