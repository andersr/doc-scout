import { twMerge } from "tailwind-merge";
import { DEFAULT_ICON_SIZE } from "~/config/icons";

export function Icon({
  name,
  fontSize,
  customStyles,
  ariaLabel,
}: {
  name: string;
  fontSize?: string;
  customStyles?: string;
  ariaLabel?: string;
}) {
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
