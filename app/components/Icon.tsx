import { twMerge } from "tailwind-merge";
import { APP_ICONS, DEFAULT_ICON_SIZE } from "~/config/icons";

export interface IconProps {
  customStyles?: string;
  fontSize?: string;
  /**
   * used for tooltip and aria-label for accessibility
   */
  label?: string;
  name: keyof typeof APP_ICONS;
}

export function Icon({ customStyles, fontSize, label, name }: IconProps) {
  const labelWithFallback = label ?? APP_ICONS[name];
  return (
    <span
      style={{
        fontSize: fontSize || DEFAULT_ICON_SIZE,
      }}
      aria-label={labelWithFallback}
      title={labelWithFallback}
      className={twMerge(
        "material-symbols-outlined",

        customStyles,
      )}
      dangerouslySetInnerHTML={{ __html: APP_ICONS[name] }}
    />
  );
}
