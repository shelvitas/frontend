import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const { Footer } = await import("@/components/layout/footer");

describe("Footer", () => {
  it("should render without crashing", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("should render the brand name", () => {
    render(<Footer />);
    expect(screen.getByText("Shelvitas")).toBeInTheDocument();
  });

  it("should render the three link section headings", () => {
    render(<Footer />);

    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("should render Browse section links with correct hrefs", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Books" })).toHaveAttribute(
      "href",
      "/books",
    );
    expect(screen.getByRole("link", { name: "Shelves" })).toHaveAttribute(
      "href",
      "/shelves",
    );
    expect(screen.getByRole("link", { name: "Members" })).toHaveAttribute(
      "href",
      "/members",
    );
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute(
      "href",
      "/journal",
    );
  });

  it("should render Product section links with correct hrefs", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "Pro" })).toHaveAttribute(
      "href",
      "/pro",
    );
    expect(screen.getByRole("link", { name: "Apps" })).toHaveAttribute(
      "href",
      "/apps",
    );
    expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute(
      "href",
      "/help",
    );
  });

  it("should render Legal section links with correct hrefs", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "API" })).toHaveAttribute(
      "href",
      "/api",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("should render copyright with the current year", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${year}.*Shelvitas`)),
    ).toBeInTheDocument();
  });

  it("should render the tagline about tracking books", () => {
    render(<Footer />);

    expect(screen.getByText(/Track books/i)).toBeInTheDocument();
  });
});
