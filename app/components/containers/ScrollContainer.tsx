import type { RefObject } from "react";
import { twMerge } from "tailwind-merge";

export function ScrollContainer({
  children,
  height,
  listBottomRef,
  marginBottom,
}: {
  children: React.ReactNode;
  height: string; // TODO:enable tw autocomplete
  listBottomRef: RefObject<HTMLDivElement | null>;
  marginBottom: string; // TODO:enable tw autocomplete
}) {
  return (
    <div
      className={twMerge(
        "flex size-full flex-col overflow-scroll rounded border border-stone-300 p-4",
        height,
        marginBottom,
      )}
    >
      {children}
      {/* <div className="h-32">&nbsp;</div> */}
      <div ref={listBottomRef}></div>
      <div className="h-96">&nbsp;</div>
    </div>
  );
}
