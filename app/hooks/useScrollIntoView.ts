import { useEffect, useRef } from "react";

export function useScrollIntoView({
  onAnyTrue,
  onLoad,
}: {
  onAnyTrue: (boolean | null)[];
  onLoad?: boolean;
}) {
  const listBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (onLoad && listBottomRef.current) {
      listBottomRef.current?.scrollIntoView();
    }
  }, [onLoad]);

  useEffect(() => {
    if (
      onAnyTrue.length > 0 &&
      onAnyTrue.some((el) => !!el) &&
      listBottomRef.current
    ) {
      listBottomRef.current?.scrollIntoView();
    }
  }, [onAnyTrue]);

  return listBottomRef;
}
