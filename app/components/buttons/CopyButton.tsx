import { Icon } from "../Icon";
import { Button } from "../ui/button";

interface Props {
  children?: React.ReactNode;
  copyDone: boolean;
  onClick: () => void;
}
export function CopyButton({ onClick, copyDone }: Props) {
  return (
    <Button variant={"outline"} onClick={onClick}>
      <Icon name={copyDone ? "done" : "content_copy"} />{" "}
      {copyDone ? "Copied" : "Copy"}
    </Button>
  );
}
