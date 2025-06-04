import { twMerge } from "tailwind-merge";
import { BUTTON_STYLES } from "~/styles/buttons";

interface Props {
  children: React.ReactNode;
}

export function ActionButton(
  props: Props & { disabled?: boolean; onClick?: () => void; type?: "submit" },
) {
  const { children, ...rest } = props;
  return (
    <button {...rest} className={twMerge(BUTTON_STYLES)}>
      {children}
    </button>
  );
}
