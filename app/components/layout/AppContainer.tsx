import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppContainer({ children, className }: Props) {
  return (
    <div
      className={twMerge(
        "flex h-full flex-col pt-4 pr-4 pl-4 md:pr-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
