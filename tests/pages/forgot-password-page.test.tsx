import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockResetPassword = vi.fn();

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

const ForgotPasswordPageModule = await import(
  "@/app/(auth)/forgot-password/page"
);
const ForgotPasswordPage = ForgotPasswordPageModule.default;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ForgotPasswordPage", () => {
  it("renders the email input and the send reset link button", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send reset link/i }),
    ).toBeInTheDocument();
  });

  it("links back to the sign-in page", () => {
    render(<ForgotPasswordPage />);

    const backLink = screen.getByRole("link", { name: /Back to sign in/i });
    expect(backLink).toHaveAttribute("href", "/sign-in");
  });

  it("email input is required and has type email", () => {
    render(<ForgotPasswordPage />);

    const email = screen.getByPlaceholderText(
      "Email address",
    ) as HTMLInputElement;
    expect(email.type).toBe("email");
    expect(email.required).toBe(true);
  });

  it("calls resetPassword with the entered email on submit", async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset link/i }),
    );

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("alice@example.com");
    });
  });

  it("renders the success state with the submitted email after success", async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset link/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    // The form no longer renders after success
    expect(
      screen.queryByPlaceholderText("Email address"),
    ).not.toBeInTheDocument();
  });

  it("shows an error message when resetPassword throws", async () => {
    mockResetPassword.mockRejectedValueOnce(new Error("User not found"));
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset link/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });
  });

  it("shows a fallback error message when a non-Error is thrown", async () => {
    mockResetPassword.mockRejectedValueOnce("boom");
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset link/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to send reset email")).toBeInTheDocument();
    });
  });

  it("disables the submit button while the reset request is in flight", async () => {
    let resolveReset: () => void = () => {};
    mockResetPassword.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveReset = resolve;
        }),
    );
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset link/i }),
    );

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Sending/i });
      expect(btn).toBeDisabled();
    });

    resolveReset();
  });
});
