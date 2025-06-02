import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function BaseLayout({ children, className }: Props) {
  return (
    <div className={twMerge("flex h-full flex-col px-6 pt-2 pb-6", className)}>
      {children}
    </div>
  );
}
