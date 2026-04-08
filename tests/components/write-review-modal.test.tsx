import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const { WriteReviewModal } =
  await import("@/components/book/write-review-modal");

// Preserve original window.location so we can restore between tests
const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: { access_token: "token" } as never,
    user: { id: "u1" } as never,
    profile: { id: "p1", username: "alice" } as never,
    isLoading: false,
  });

  // Stub window.location so handleSubmit's redirect doesn't crash jsdom
  Object.defineProperty(window, "location", {
    writable: true,
    value: { href: "" },
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: originalLocation,
  });
});

describe("WriteReviewModal", () => {
  it("should render the default trigger button", () => {
    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);

    expect(
      screen.getByRole("button", { name: /write a review/i }),
    ).toBeInTheDocument();
  });

  it("should open the modal and show the form when trigger is clicked", () => {
    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));

    // Dialog title
    expect(screen.getByText("Write a Review")).toBeInTheDocument();
    // Book title appears in the book strip
    expect(screen.getByText("Dune")).toBeInTheDocument();
    // Textarea with placeholder
    expect(
      screen.getByPlaceholderText("What did you think of this book?"),
    ).toBeInTheDocument();
    // Spoiler checkbox (themed Checkbox uses role="checkbox")
    expect(
      screen.getByRole("checkbox", {
        name: /this review contains spoilers/i,
      }),
    ).toBeInTheDocument();
    // Rating widget
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("should disable the Publish button until body is non-empty", () => {
    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));

    const publishButton = screen.getByRole("button", {
      name: /publish review/i,
    });
    expect(publishButton).toBeDisabled();

    fireEvent.change(
      screen.getByPlaceholderText("What did you think of this book?"),
      { target: { value: "This was amazing" } },
    );

    expect(publishButton).not.toBeDisabled();
  });

  it("should toggle the spoiler checkbox when clicked", () => {
    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));

    const spoilerCheckbox = screen.getByRole("checkbox", {
      name: /this review contains spoilers/i,
    });
    expect(spoilerCheckbox).toHaveAttribute("aria-checked", "false");

    fireEvent.click(spoilerCheckbox);
    expect(spoilerCheckbox).toHaveAttribute("aria-checked", "true");
  });

  it("should POST to /v1/reviews with bookId, body, rating, and containsSpoilers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "review-1" } }),
    });

    render(<WriteReviewModal bookId="book-42" bookTitle="Dune" />);
    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));

    // Fill body
    fireEvent.change(
      screen.getByPlaceholderText("What did you think of this book?"),
      { target: { value: "A masterpiece of science fiction." } },
    );

    // Select 4-star rating
    fireEvent.click(screen.getByLabelText("4 stars"));

    // Toggle spoiler
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /this review contains spoilers/i,
      }),
    );

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /publish review/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:4000/v1/reviews");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer token");

    const body = JSON.parse(options.body);
    expect(body.bookId).toBe("book-42");
    expect(body.body).toBe("A masterpiece of science fiction.");
    expect(body.containsSpoilers).toBe(true);
    expect(body.rating).toBe(4);
  });

  it("should NOT POST to /v1/lists (wrong endpoint)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "review-1" } }),
    });

    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);
    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));
    fireEvent.change(
      screen.getByPlaceholderText("What did you think of this book?"),
      { target: { value: "Nice" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /publish review/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain("/v1/lists");
  });

  it("should call onSaved with the new review id instead of redirecting", async () => {
    const onSaved = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ data: { id: "review-saved-1" } }),
    });

    render(
      <WriteReviewModal bookId="book-1" bookTitle="Dune" onSaved={onSaved} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));
    fireEvent.change(
      screen.getByPlaceholderText("What did you think of this book?"),
      { target: { value: "Fantastic read." } },
    );
    fireEvent.click(screen.getByRole("button", { name: /publish review/i }));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith("review-saved-1");
    });
  });

  it("should display an error message when the API call fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: "Validation failed" } }),
    });

    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);
    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));
    fireEvent.change(
      screen.getByPlaceholderText("What did you think of this book?"),
      { target: { value: "Review body" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /publish review/i }));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
  });

  it("should redirect to /sign-in when trigger clicked while unauthenticated", () => {
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    });

    render(<WriteReviewModal bookId="book-1" bookTitle="Dune" />);

    fireEvent.click(screen.getByRole("button", { name: /write a review/i }));

    expect(window.location.href).toBe("/sign-in");
  });
});
