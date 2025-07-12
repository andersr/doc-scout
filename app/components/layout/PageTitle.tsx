import { twMerge } from "tailwind-merge";
import { setWindowTitle } from "~/utils/setWindowTitle";

export function PageTitle({
  danger,
  title,
}: {
  danger?: boolean;
  title: string;
}) {
  return (
    <>
      <title>{setWindowTitle(title)}</title>
      <h1
        className={twMerge(
          "text-4xl leading-tight font-semibold text-stone-600 font-stretch-50% md:inline-block md:text-5xl md:font-stretch-50%",
          danger ? "text-danger" : "text-stone-600",
        )}
      >
        {title}
      </h1>
    </>
  );
}
