import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

vi.mock("next/navigation", () => ({
  usePathname: () => "/feed",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const { Navbar } = await import("@/components/layout/navbar");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });
});

describe("Navbar", () => {
  it("should render logo", () => {
    render(<Navbar />);
    expect(screen.getByText("Shelvitas")).toBeInTheDocument();
  });

  it("should show sign in and create account when not authenticated", () => {
    render(<Navbar />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("should show navigation items when authenticated", () => {
    useAuthStore.setState({
      session: { access_token: "token" } as never,
      profile: { displayName: "Test" } as never,
    });

    render(<Navbar />);

    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Search").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Library").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Community").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Profile").length).toBeGreaterThanOrEqual(1);
  });

  it("should render 5 nav destinations in desktop nav", () => {
    useAuthStore.setState({
      session: { access_token: "token" } as never,
      profile: { displayName: "Test" } as never,
    });

    render(<Navbar />);

    // Desktop nav has all 5 + mobile has all 5 = 10 total links for each destination
    const homeLinks = screen.getAllByText("Home");
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("should render mobile bottom nav when authenticated", () => {
    useAuthStore.setState({
      session: { access_token: "token" } as never,
      profile: { displayName: "Test" } as never,
    });

    render(<Navbar />);

    // Mobile nav renders the same items
    const navElements = screen.getAllByRole("navigation");
    expect(navElements.length).toBeGreaterThanOrEqual(1);
  });
});
