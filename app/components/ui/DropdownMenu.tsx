import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useClickOutside } from "~/hooks/useClickOutside";

interface Props {
  children: React.ReactNode;
  items: React.JSX.Element[];
}

// TODO: refactor and merge with MoreMenu
export function DropdownMenu({ children, items }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { componentRef } = useClickOutside({
    handleClickOuside: () => setIsMenuOpen(false),
  });

  return (
    <div ref={componentRef} className="relative flex items-center gap-1">
      <button
        onClick={toggleMenu}
        className={twMerge(
          "flex cursor-pointer items-center rounded p-1 text-base",
        )}
      >
        {children}
      </button>
      <div
        className={twMerge(
          "absolute top-12 right-0 z-0 flex w-44 flex-col justify-around rounded bg-white shadow-md",
          isMenuOpen ? "flex flex-col" : "hidden",
        )}
      >
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}
