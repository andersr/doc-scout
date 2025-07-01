import { twMerge } from "tailwind-merge";
import { BUTTON_STYLES } from "~/styles/buttons";

interface Props {
  children: React.ReactNode;
  customStyles?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit";
}

export function ActionButton(props: Props & {}) {
  const { children, customStyles, ...rest } = props;
  return (
    <button {...rest} className={twMerge(BUTTON_STYLES, customStyles)}>
      {children}
    </button>
  );
}
