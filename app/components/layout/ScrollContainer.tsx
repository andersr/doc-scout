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
        "h-[calc(100vh-290px)] overflow-y-scroll rounded border border-stone-300 p-4 inset-shadow-sm inset-shadow-slate-300/40 md:h-[calc(100vh-340px)]",
      )}
    >
      {children}
      <div ref={listBottomRef} />
    </div>
  );
}
