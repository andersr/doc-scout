import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppContainer({ children, className }: Props) {
  return (
    <div className={twMerge("flex h-full flex-col p-4", className)}>
      {children}
    </div>
  );
}
