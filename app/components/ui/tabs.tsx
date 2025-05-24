import React from "react";
import { cn } from "~/lib/utils";

interface TabsContextValue {
  onValueChange: (value: string) => void;
  value: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined,
);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

interface TabsProps {
  children: React.ReactNode;
  className?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

function Tabs({
  children,
  className,
  defaultValue,
  onValueChange,
  value,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const currentValue = value ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider
      value={{ onValueChange: handleValueChange, value: currentValue }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
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
  value: string;
}

function TabButton({ children, className, value }: TabButtonProps) {
  const { onValueChange, value: currentValue } = useTabsContext();
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
  value: string;
}

function TabContent({ children, className, value }: TabContentProps) {
  const { value: currentValue } = useTabsContext();

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

export { TabButton, TabContent, Tabs, TabsList };
