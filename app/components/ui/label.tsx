// import * as LabelPrimitive from "@radix-ui/react-label";

import { twMerge } from "tailwind-merge";

// import { cn } from "~/lib/utils";

// function Label({
//   className,
//   ...props
// }: React.ComponentProps<typeof LabelPrimitive.Root>) {
//   return (
//     <LabelPrimitive.Root
//       data-slot="label"
//       className={cn(
//         "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
//         className,
//       )}
//       {...props}
//     />
//   );
// }

// export { Label };

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
