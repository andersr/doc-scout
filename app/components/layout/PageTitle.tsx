import { twMerge } from "tailwind-merge";

export function PageTitle({
  centered,
  children,
  danger,
}: {
  centered?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <h1
      className={twMerge(
        "inline text-4xl text-stone-600 font-stretch-50% md:inline-block md:font-semibold md:font-stretch-50%",
        danger ? "text-danger" : "text-stone-600",
        centered && "text-center",
      )}
    >
      {children}
    </h1>
  );
}
