import { twMerge } from "tailwind-merge";

export function PageTitle({
  centered,
  children,
  customStyles,
  danger,
}: {
  centered?: boolean;
  children: React.ReactNode;
  customStyles?: string;
  danger?: boolean;
}) {
  return (
    <h1
      className={twMerge(
        "inline text-3xl text-stone-600 font-stretch-50% md:inline-block md:font-semibold md:font-stretch-50%",
        danger ? "text-danger" : "text-stone-600",
        centered && "w-full text-center",
        customStyles,
      )}
    >
      {children}
    </h1>
  );
}
