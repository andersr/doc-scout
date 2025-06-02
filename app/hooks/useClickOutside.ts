import { useEffect, useRef } from "react";

export function useClickOutside({
  handleClickOuside,
}: {
  handleClickOuside: () => void;
}) {
  const componentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        handleClickOuside();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentRef, handleClickOuside]);

  return {
    componentRef,
  };
}
