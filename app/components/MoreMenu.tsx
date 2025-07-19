import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useClickOutside } from "~/hooks/useClickOutside";
import { useResponsive } from "~/hooks/useResponsive";
import type { MenuAction } from "~/types/menu";
import { Icon } from "./ui/Icon";
import { MenuButton, MenuLink } from "./ui/buttons/MenuButton";

interface Props {
  actions: MenuAction[];
}

export function MoreMenu({ actions }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useResponsive();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { componentRef } = useClickOutside({
    handleClickOuside: () => setIsMenuOpen(false),
  });

  return (
    <div ref={componentRef} className="relative flex items-center gap-1">
      <button
        onClick={toggleMenu}
        className={twMerge(
          "flex items-center rounded text-base",
          "cursor-pointer",
          "transition-all duration-200 ease-in-out",
          isMenuOpen ? "bg-stone-100" : "",
        )}
      >
        <Icon name="MORE" fontSize={isMobile ? "28px" : "34px"} />
      </button>
      <div
        className={twMerge(
          "absolute top-10 right-0 z-20 w-24 rounded bg-white shadow",
          isMenuOpen ? "flex flex-col items-start gap-1" : "hidden",
        )}
      >
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.button && <MenuButton {...action.button} />}
            {action.link && (
              <MenuLink {...action.link} onClick={() => setIsMenuOpen(false)} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
