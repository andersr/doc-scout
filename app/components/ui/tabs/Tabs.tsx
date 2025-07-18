import React from "react";
import { cn } from "~/lib/utils";

interface UseTabsOptions {
  currentTab?: string;
  defaultValue: string;
  onTabChange?: (currentTab: string) => void;
}

interface UseTabsReturn {
  currentTab: string;
  onTabChange: (currentTab: string) => void;
}

function useTabs({
  currentTab,
  defaultValue,
  onTabChange,
}: UseTabsOptions): UseTabsReturn {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const currentValue = currentTab ?? internalValue;
  const handleValueChange = onTabChange ?? setInternalValue;

  return {
    currentTab: currentValue,
    onTabChange: handleValueChange,
  };
}

interface TabsProps {
  children: React.ReactNode;
  className?: string;
  currentTab: string;
  onTabChange: (currentTab: string) => void;
}

function Tabs({ children, className, currentTab, onTabChange }: TabsProps) {
  return (
    <div
      className={cn("w-full", className)}
      data-tabs-value={currentTab}
      data-tabs-onchange={onTabChange.toString()}
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
  currentTab: string;
  onTabChange: (tabName: string) => void;
  tabName: string;
}

function TabButton({
  children,
  className,
  currentTab,
  onTabChange,
  tabName,
}: TabButtonProps) {
  const isSelected = currentTab === tabName;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onTabChange(tabName)}
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
  currentTab: string;
  tabName: string;
}

function TabContent({
  children,
  className,
  currentTab,
  tabName,
}: TabContentProps) {
  if (currentTab !== tabName) {
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
