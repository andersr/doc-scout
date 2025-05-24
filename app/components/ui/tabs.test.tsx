import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabButton, TabContent, Tabs, TabsList } from "./tabs";

describe("Tabs", () => {
  it("renders tabs with correct default value", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabButton value="tab1">Tab 1</TabButton>
          <TabButton value="tab2">Tab 2</TabButton>
        </TabsList>
        <TabContent value="tab1">Content 1</TabContent>
        <TabContent value="tab2">Content 2</TabContent>
      </Tabs>,
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("switches tabs when tab button is clicked", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabButton value="tab1">Tab 1</TabButton>
          <TabButton value="tab2">Tab 2</TabButton>
        </TabsList>
        <TabContent value="tab1">Content 1</TabContent>
        <TabContent value="tab2">Content 2</TabContent>
      </Tabs>,
    );

    fireEvent.click(screen.getByText("Tab 2"));

    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("applies correct aria attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabButton value="tab1">Tab 1</TabButton>
          <TabButton value="tab2">Tab 2</TabButton>
        </TabsList>
        <TabContent value="tab1">Content 1</TabContent>
        <TabContent value="tab2">Content 2</TabContent>
      </Tabs>,
    );

    const selectedTab = screen.getByRole("tab", { name: "Tab 1" });
    const unselectedTab = screen.getByRole("tab", { name: "Tab 2" });

    expect(selectedTab).toHaveAttribute("aria-selected", "true");
    expect(unselectedTab).toHaveAttribute("aria-selected", "false");
  });

  it("renders tablist with correct role", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabButton value="tab1">Tab 1</TabButton>
        </TabsList>
        <TabContent value="tab1">Content 1</TabContent>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders tabpanel with correct role", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabButton value="tab1">Tab 1</TabButton>
        </TabsList>
        <TabContent value="tab1">Content 1</TabContent>
      </Tabs>,
    );

    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });
});
