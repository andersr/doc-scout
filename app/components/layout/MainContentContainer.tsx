interface Props {
  children: React.ReactNode;
}

export function MainContentContainer({ children }: Props) {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 py-4 md:max-w-5xl md:min-w-3xl">
      {children}
    </main>
  );
}
