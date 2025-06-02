export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-5xl font-bold text-stone-600 font-stretch-50%">
      {children}
    </h1>
  );
}
