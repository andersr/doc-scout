import React from "react";
import { cn } from "~/lib/utils";

interface UseTabsOptions {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

interface UseTabsReturn {
  onValueChange: (value: string) => void;
  value: string;
}

function useTabs({
  defaultValue,
  onValueChange,
  value,
}: UseTabsOptions): UseTabsReturn {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const currentValue = value ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return {
    onValueChange: handleValueChange,
    value: currentValue,
  };
}

interface TabsProps {
  children: React.ReactNode;
  className?: string;
  onValueChange: (value: string) => void;
  value: string;
}

function Tabs({ children, className, onValueChange, value }: TabsProps) {
  return (
    <div
      className={cn("w-full", className)}
      data-tabs-value={value}
      data-tabs-onchange={onValueChange.toString()}
    >
      {children}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center border-b border-stone-300 bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabButtonProps {
  children: React.ReactNode;
  className?: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  value: string;
}

function TabButton({
  children,
  className,
  currentValue,
  onValueChange,
  value,
}: TabButtonProps) {
  const isSelected = currentValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "focus-visible:ring-pompadour relative -mb-[2px] inline-flex cursor-pointer items-center justify-center border-b-2 px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "text-pompadour border-pompadour rounded-t-lg bg-white shadow-sm"
          : "hover:text-pompadour border-transparent bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
  currentValue: string;
  value: string;
}

function TabContent({
  children,
  className,
  currentValue,
  value,
}: TabContentProps) {
  if (currentValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        "focus-visible:ring-pompadour rounded-tr-lg rounded-b-lg border border-t-0 border-stone-300 bg-white p-6 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { TabButton, TabContent, Tabs, TabsList, useTabs };
