export function ListContainer({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-20 flex flex-1 flex-col justify-end gap-6 md:mb-14">
      {children}
    </ul>
  );
}
