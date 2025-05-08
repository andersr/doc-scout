import { Icon } from "../Icon";

interface Props {
  children?: React.ReactNode;
  name: string;
  onClick: () => void;
}
export function IconButton({ name, onClick, children }: Props) {
  return (
    <button onClick={onClick} className={"flex items-center gap-1"}>
      <Icon name={name} />
      {children}
    </button>
  );
}
