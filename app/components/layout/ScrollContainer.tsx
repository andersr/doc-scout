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
        "flex min-h-96 flex-1 flex-col justify-end overflow-y-auto",
      )}
    >
      {children}
      <div ref={listBottomRef} />
    </div>
  );
}
