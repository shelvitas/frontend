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

const mockSignInWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signInWithGoogle: mockSignInWithGoogle,
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

const SignInPageModule = await import("@/app/(auth)/sign-in/page");
const SignInPage = SignInPageModule.default;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignInPage", () => {
  it("renders the email and password fields and the submit button", () => {
    render(<SignInPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders the forgot password link and sign-up link", () => {
    render(<SignInPage />);

    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    // There are two "Sign up"/"Sign in" occurrences — the link at the bottom
    const signUpLink = screen.getByRole("link", { name: "Sign up" });
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });

  it("email field enforces type=email and password minLength=8", () => {
    render(<SignInPage />);

    const email = screen.getByPlaceholderText(
      "Email address",
    ) as HTMLInputElement;
    const password = screen.getByPlaceholderText(
      "Password",
    ) as HTMLInputElement;

    expect(email.type).toBe("email");
    expect(email.required).toBe(true);
    expect(password.type).toBe("password");
    expect(password.required).toBe(true);
    expect(password.minLength).toBe(8);
  });

  it("calls signInWithEmail with the entered credentials on submit", async () => {
    mockSignInWithEmail.mockResolvedValueOnce(undefined);
    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "superSecret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith(
        "alice@example.com",
        "superSecret123",
      );
    });
  });

  it("shows the error message when signInWithEmail throws", async () => {
    mockSignInWithEmail.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "bob@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows a fallback error message when the thrown value is not an Error", async () => {
    mockSignInWithEmail.mockRejectedValueOnce("boom");
    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "bob@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to sign in")).toBeInTheDocument();
    });
  });

  it("disables the submit button while signing in", async () => {
    let resolveSignIn: () => void = () => {};
    mockSignInWithEmail.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        }),
    );
    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "superSecret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Signing in/i });
      expect(btn).toBeDisabled();
    });

    // Clean up the pending promise so React doesn't complain
    resolveSignIn();
  });

  it("clears a previous error when a new submit begins", async () => {
    mockSignInWithEmail
      .mockRejectedValueOnce(new Error("First failure"))
      .mockResolvedValueOnce(undefined);
    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("First failure")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.queryByText("First failure")).not.toBeInTheDocument();
    });
  });
});
