import { Icon } from "../Icon";
import { Button } from "../ui/button";

interface Props {
  children?: React.ReactNode;
  copyDone: boolean;
  onClick: () => void;
}
export function CopyButton({ copyDone, onClick }: Props) {
  return (
    <Button variant={"outline"} onClick={onClick}>
      <Icon name={copyDone ? "DONE" : "COPY"} /> {copyDone ? "Copied" : "Copy"}
    </Button>
  );
}
