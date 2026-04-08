import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

vi.mock("@/components/ui/toaster", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { CreateShelfModal } =
  await import("@/components/shelf/create-shelf-modal");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1", username: "alice" } as never,
    isLoading: false,
  });
});

describe("CreateShelfModal", () => {
  it("should render the trigger button by default", () => {
    render(<CreateShelfModal />);
    expect(screen.getByText("Create shelf")).toBeInTheDocument();
  });

  it("should open the modal and show the form when trigger is clicked", () => {
    render(<CreateShelfModal />);

    fireEvent.click(screen.getByText("Create shelf"));

    expect(screen.getByText("Create a Shelf")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g. Best sci-fi of 2024"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's this shelf about?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ranked")).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("should POST to /v1/shelves with the form values when submitted", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "new-shelf-1" } }),
    });

    // Stub navigation so we don't crash on window.location.href assignment
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    render(<CreateShelfModal />);
    fireEvent.click(screen.getByText("Create shelf"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Best sci-fi of 2024"), {
      target: { value: "Best fantasy" },
    });
    fireEvent.change(screen.getByPlaceholderText("What's this shelf about?"), {
      target: { value: "My favs" },
    });

    // Click the submit button (the one inside the dialog with text "Create shelf")
    const buttons = screen.getAllByRole("button", { name: /create shelf/i });
    // The submit button is the last one (the trigger is also "Create shelf")
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:4000/v1/shelves");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer token");

    const body = JSON.parse(options.body);
    expect(body.title).toBe("Best fantasy");
    expect(body.description).toBe("My favs");
    expect(body.isRanked).toBe(false);
    expect(body.isPrivate).toBe(false);

    // Restore window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("should NOT POST to /v1/lists (the old endpoint)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "x" } }),
    });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    render(<CreateShelfModal />);
    fireEvent.click(screen.getByText("Create shelf"));
    fireEvent.change(screen.getByPlaceholderText("e.g. Best sci-fi of 2024"), {
      target: { value: "T" },
    });
    const buttons = screen.getAllByRole("button", { name: /create shelf/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain("/v1/lists");

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("should disable the submit button when title is empty", () => {
    render(<CreateShelfModal />);
    fireEvent.click(screen.getByText("Create shelf"));

    const buttons = screen.getAllByRole("button", { name: /create shelf/i });
    const submitButton = buttons[buttons.length - 1];
    expect(submitButton).toBeDisabled();
  });

  it("should call onSaved instead of redirecting when callback provided", async () => {
    const onSaved = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "saved-1" } }),
    });

    render(<CreateShelfModal onSaved={onSaved} />);
    fireEvent.click(screen.getByText("Create shelf"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Best sci-fi of 2024"), {
      target: { value: "Test" },
    });

    const buttons = screen.getAllByRole("button", { name: /create shelf/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith("saved-1");
    });
  });

  it("should redirect to /sign-in (not /sign-up) when not authenticated", () => {
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    });

    const originalLocation = window.location;
    const locationStub = { href: "" };
    Object.defineProperty(window, "location", {
      writable: true,
      value: locationStub,
    });

    render(<CreateShelfModal />);
    fireEvent.click(screen.getByText("Create shelf"));

    expect(locationStub.href).toBe("/sign-in");

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });
});
