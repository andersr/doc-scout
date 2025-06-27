import type { APP_ICONS } from "~/config/icons";
import { Icon } from "../Icon";

interface Props {
  children?: React.ReactNode;
  name: keyof typeof APP_ICONS;
  title?: string;
}
export function IconButton({
  children,
  name,
  onClick,
  title,
}: Props & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={"flex cursor-pointer items-center gap-1"}
    >
      <Icon name={name} label={title} />
      {children}
    </button>
  );
}
