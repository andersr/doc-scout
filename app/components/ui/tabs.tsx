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
        "bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1",
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
        "ring-offset-background focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow"
          : "hover:bg-background/50 hover:text-foreground",
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
        "ring-offset-background focus-visible:ring-ring mt-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { TabButton, TabContent, Tabs, TabsList, useTabs };
