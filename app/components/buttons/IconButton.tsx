import type { APP_ICONS } from "~/config/icons";
import { Icon } from "../renamed/icon";

interface Props {
  children?: React.ReactNode;
  name: keyof typeof APP_ICONS;
  onClick: () => void;
}
export function IconButton({ children, name, onClick }: Props) {
  return (
    <button onClick={onClick} className={"flex items-center gap-1"}>
      <Icon name={name} />
      {children}
    </button>
  );
}
