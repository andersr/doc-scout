import { useRef } from "react";

export function useScrollIntoView() {
  const listBottomRef = useRef<HTMLDivElement | null>(null);

  const scrollIntoView = () => {
    listBottomRef.current?.scrollIntoView();
  };

  return { listBottomRef, scrollIntoView };
}
