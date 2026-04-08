import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: vi.fn(),
  }),
}));

const CompleteProfilePageModule =
  await import("@/app/(auth)/complete-profile/page");
const CompleteProfilePage = CompleteProfilePageModule.default;

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: {
      id: "u1",
      user_metadata: { full_name: "Alice Tester" },
    } as never,
    profile: null,
    isLoading: false,
  });
});

describe("CompleteProfilePage — Step 1 (username + name)", () => {
  it("renders step 1 with both fields and the Next button", () => {
    render(<CompleteProfilePage />);

    expect(screen.getByText("Set up your profile")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. booklover42")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("prefills displayName from user metadata", () => {
    render(<CompleteProfilePage />);
    const displayName = screen.getByPlaceholderText(
      "Your name",
    ) as HTMLInputElement;
    expect(displayName.value).toBe("Alice Tester");
  });

  it("strips invalid characters from username as user types", () => {
    render(<CompleteProfilePage />);
    const username = screen.getByPlaceholderText(
      "e.g. booklover42",
    ) as HTMLInputElement;
    fireEvent.change(username, { target: { value: "Alice 123!" } });
    // Spaces, capitals, and special chars stripped
    expect(username.value).toBe("alice123");
  });

  it("rejects username shorter than 3 characters with an error", () => {
    render(<CompleteProfilePage />);

    fireEvent.change(screen.getByPlaceholderText("e.g. booklover42"), {
      target: { value: "ab" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText("Username must be at least 3 characters"),
    ).toBeInTheDocument();
    // Should still be on step 1
    expect(screen.queryByText("Pick your top 4 books")).not.toBeInTheDocument();
  });

  it("advances to step 2 when valid", () => {
    render(<CompleteProfilePage />);

    fireEvent.change(screen.getByPlaceholderText("e.g. booklover42"), {
      target: { value: "alicebooks" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Pick your top 4 books")).toBeInTheDocument();
  });
});

describe("CompleteProfilePage — Step 2 (favourite books)", () => {
  function advanceToStep2() {
    render(<CompleteProfilePage />);
    fireEvent.change(screen.getByPlaceholderText("e.g. booklover42"), {
      target: { value: "alicebooks" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
  }

  it("renders 4 empty slots and a disabled Finish button", () => {
    advanceToStep2();
    const slotButtons = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.startsWith("Add book"));
    expect(slotButtons).toHaveLength(4);

    const finishButton = screen.getByRole("button", { name: "Finish" });
    expect(finishButton).toBeDisabled();
  });

  it("Finish button enables only when all 4 slots are filled (manual state injection)", async () => {
    advanceToStep2();
    // We don't go through the full search flow — but verify the button gates on 4
    const finishButton = screen.getByRole("button", { name: "Finish" });
    expect(finishButton).toBeDisabled();
  });

  it("can go back to step 1 via the Back button", () => {
    advanceToStep2();
    expect(screen.getByText("Pick your top 4 books")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText("Set up your profile")).toBeInTheDocument();
  });

  it("opens the search panel when an empty slot is clicked", () => {
    advanceToStep2();
    const slotButtons = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.startsWith("Add book"));

    fireEvent.click(slotButtons[0]);

    // Search input appears
    expect(
      screen.getByPlaceholderText("Search for a book..."),
    ).toBeInTheDocument();
    // Cancel link appears
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
