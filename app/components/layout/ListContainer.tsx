export function ListContainer({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col justify-end gap-6">{children}</ul>;
}
