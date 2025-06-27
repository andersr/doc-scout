import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabButton, TabContent, Tabs, TabsList, useTabs } from "./TabsTmp";

// Test component that uses the useTabs hook
function TestTabs({ defaultValue }: { defaultValue: string }) {
  const { onValueChange, value } = useTabs({ defaultValue });

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabButton
          value="tab1"
          currentValue={value}
          onValueChange={onValueChange}
        >
          Tab 1
        </TabButton>
        <TabButton
          value="tab2"
          currentValue={value}
          onValueChange={onValueChange}
        >
          Tab 2
        </TabButton>
      </TabsList>
      <TabContent value="tab1" currentValue={value}>
        Content 1
      </TabContent>
      <TabContent value="tab2" currentValue={value}>
        Content 2
      </TabContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders tabs with correct default value", () => {
    render(<TestTabs defaultValue="tab1" />);

    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("switches tabs when tab button is clicked", () => {
    render(<TestTabs defaultValue="tab1" />);

    fireEvent.click(screen.getByText("Tab 2"));

    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("applies correct aria attributes", () => {
    render(<TestTabs defaultValue="tab1" />);

    const selectedTab = screen.getByRole("tab", { name: "Tab 1" });
    const unselectedTab = screen.getByRole("tab", { name: "Tab 2" });

    expect(selectedTab).toHaveAttribute("aria-selected", "true");
    expect(unselectedTab).toHaveAttribute("aria-selected", "false");
  });

  it("renders tablist with correct role", () => {
    render(<TestTabs defaultValue="tab1" />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders tabpanel with correct role", () => {
    render(<TestTabs defaultValue="tab1" />);

    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
