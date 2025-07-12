interface Props {
  children: React.ReactNode;
}
export function MainContent({ children }: Props) {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col items-center gap-6 py-4">
      {children}
    </main>
  );
}
