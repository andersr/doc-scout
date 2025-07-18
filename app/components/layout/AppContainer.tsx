import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AppContainer({ children, className }: Props) {
  return (
    <div className={twMerge("md:bg-background size-full bg-white", className)}>
      <div className="relative flex h-full flex-col overflow-hidden md:mx-auto md:w-3xl">
        {children}
      </div>
    </div>
  );
}
