import { useEffect, useRef, useState } from "react";

export function useIsScrolling() {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  // TODO: add in debounced inHotZone state to improve performance

  useEffect(() => {
    function handleScroll() {
      if (componentRef.current) {
        setIsScrolling(componentRef.current?.scrollTop !== 0);
      } else {
        setIsScrolling(window.scrollY !== 0);
      }
    }
    const el = componentRef.current ?? window;
    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    componentRef,
    isScrolling,
  };
}
