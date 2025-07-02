import { Icon } from "../ui/Icon";

interface Props {
  children?: React.ReactNode;
  didCopy: boolean;
  onClick: () => void;
}
export function CopyButton({ didCopy, onClick }: Props) {
  return (
    <button
      className="flex cursor-pointer items-center rounded-md bg-amber-100/40 p-1 hover:bg-amber-200"
      onClick={() => onClick()}
    >
      <Icon
        name={didCopy ? "DONE" : "COPY"}
        label={didCopy ? "Copied" : "Copy to clipboard"}
      />
    </button>
  );
}
