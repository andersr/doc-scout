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
        "mb-16 h-[calc(100vh-250px)] overflow-y-scroll rounded border border-stone-300 p-4 inset-shadow-sm inset-shadow-slate-300/40",
      )}
    >
      {children}
      <div ref={listBottomRef} />
    </div>
  );
}
