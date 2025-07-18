import useBreakpoint from "use-breakpoint";
import { BREAKPOINTS } from "~/config/breakpoints";

export function useResponsive() {
  const { breakpoint } = useBreakpoint(BREAKPOINTS);

  return {
    isMobile: breakpoint === "mobile",
  };
}
