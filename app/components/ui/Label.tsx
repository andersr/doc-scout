import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  className?: string;
  htmlFor: string;
}
export function Label({ children, className, htmlFor }: Props) {
  return (
    <label htmlFor={htmlFor} className={twMerge("mb-2 block", className)}>
      {children}
    </label>
  );
}
