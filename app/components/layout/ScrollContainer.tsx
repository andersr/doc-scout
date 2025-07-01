import type { RefObject } from "react";
import { twMerge } from "tailwind-merge";

export function ScrollContainer({
  children,
  listBottomRef,
}: {
  children: React.ReactNode;
  listBottomRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={twMerge(
        "mb-16 flex flex-1 flex-col justify-end rounded border border-stone-300 p-4",
      )}
    >
      {children}
      <div ref={listBottomRef}></div>
    </div>
  );
}
