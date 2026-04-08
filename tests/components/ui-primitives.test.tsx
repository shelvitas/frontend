/**
 * Smoke tests for the shadcn-style UI primitives. These components are
 * mostly pure forwardRef wrappers so the tests focus on:
 *   - they render without crashing
 *   - they accept and forward standard HTML attributes
 *   - they merge passed className with their default classes
 *   - the variant/size props (where applicable) actually change the output
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("merges custom className with default classes", () => {
    render(<Button className="custom-class">x</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom-class");
    // Default base classes still applied
    expect(btn.className).toContain("inline-flex");
  });

  it("applies destructive variant styles", () => {
    render(<Button variant="destructive">delete</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-destructive");
  });

  it("applies outline variant styles", () => {
    render(<Button variant="outline">outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border");
  });

  it("applies size sm", () => {
    render(<Button size="sm">small</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("h-9");
  });

  it("respects disabled prop", () => {
    render(<Button disabled>nope</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards type attribute", () => {
    render(<Button type="submit">go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="enter text" />);
    expect(screen.getByPlaceholderText("enter text")).toBeInTheDocument();
  });

  it("forwards type attribute", () => {
    render(<Input type="email" placeholder="email" />);
    const input = screen.getByPlaceholderText("email") as HTMLInputElement;
    expect(input.type).toBe("email");
  });

  it("merges custom className", () => {
    render(<Input className="custom" placeholder="x" />);
    const input = screen.getByPlaceholderText("x");
    expect(input.className).toContain("custom");
    expect(input.className).toContain("rounded-md");
  });

  it("forwards value and onChange", () => {
    const onChange = vi.fn();
    render(<Input value="initial" onChange={onChange} placeholder="x" />);
    const input = screen.getByPlaceholderText("x") as HTMLInputElement;
    expect(input.value).toBe("initial");
  });

  it("supports disabled state", () => {
    render(<Input disabled placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toBeDisabled();
  });
});

describe("Spinner", () => {
  it("renders an svg with spin animation", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.className.baseVal ?? "").toContain("animate-spin");
  });

  it("merges custom className", () => {
    const { container } = render(<Spinner className="text-red-500" />);
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal ?? "").toContain("text-red-500");
  });

  it("has the default h-4 w-4 size", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal ?? "").toContain("h-4");
    expect(svg?.className.baseVal ?? "").toContain("w-4");
  });
});

describe("Card", () => {
  it("renders Card with children", () => {
    render(
      <Card>
        <CardContent>card body</CardContent>
      </Card>,
    );
    expect(screen.getByText("card body")).toBeInTheDocument();
  });

  it("renders CardHeader and CardTitle", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>my title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("my title")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(
      <Card>
        <CardFooter>footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("footer")).toBeInTheDocument();
  });

  it("merges custom className on Card", () => {
    const { container } = render(<Card className="custom-card">x</Card>);
    expect(container.firstChild).toHaveClass("custom-card");
  });

  it("composes header + content + footer in order", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
