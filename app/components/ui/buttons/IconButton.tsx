import { Icon, type IconProps } from "../Icon";

interface Props extends IconProps {
  children?: React.ReactNode;
  // title?: string;
}
export function IconButton({
  children,
  customStyles,
  label,
  name,
  onClick,
}: Props & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={"flex cursor-pointer items-center gap-1"}
    >
      <Icon name={name} label={label} customStyles={customStyles} />
      {children}
    </button>
  );
}
