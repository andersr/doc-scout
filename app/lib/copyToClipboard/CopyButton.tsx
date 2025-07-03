import { Icon } from "../../components/ui/Icon";

interface Props {
  children?: React.ReactNode;
  didCopy: boolean;
  onClick: () => void;
}
export function CopyButton({ didCopy, onClick }: Props) {
  return (
    <button
      className="flex cursor-pointer items-center rounded-md p-0.5 hover:bg-amber-200"
      onClick={() => onClick()}
    >
      <Icon
        name={didCopy ? "DONE" : "COPY"}
        label={didCopy ? "Copied" : "Copy to clipboard"}
        customStyles="text-slate-600/50 hover:text-slate-600"
      />
    </button>
  );
}
