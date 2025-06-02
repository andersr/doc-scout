import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useClickOutside } from "~/hooks/useClickOutside";

interface Props {
  children: React.ReactNode;
  items: React.JSX.Element[];
}

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
          "text-grey-4 hover:bg-grey-1 flex cursor-pointer items-center rounded p-1 text-base",
        )}
      >
        {children}
      </button>
      <div
        className={twMerge(
          "absolute top-12 right-0 z-20 flex w-36 flex-col justify-around gap-1 rounded bg-white px-2 py-1 shadow",
          isMenuOpen ? "flex flex-col" : "hidden",
        )}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
