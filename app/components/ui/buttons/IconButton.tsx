import { twMerge } from "tailwind-merge";

interface Props {
  children?: React.ReactNode;
  customStyles?: string;
  onClick: () => void;
}

export function IconButton({
  children,
  customStyles,
  onClick,
}: Props & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        "flex cursor-pointer items-center gap-1",
        customStyles,
      )}
    >
      {children}
    </button>
  );
}
