export function ListContainer({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-1 flex-col gap-6">{children}</ul>;
}
