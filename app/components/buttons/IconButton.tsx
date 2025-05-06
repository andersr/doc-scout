interface Props {
  children: React.ReactNode;
  onClick: () => void;
}
export function IconButton({ children, onClick }: Props) {
  return (
    <button onClick={onClick} className={"flex items-center"}>
      {children}
    </button>
  );
}
