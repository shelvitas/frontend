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

const mockSignUpWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    signUpWithEmail: mockSignUpWithEmail,
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

const SignUpPageModule = await import("@/app/(auth)/sign-up/page");
const SignUpPage = SignUpPageModule.default;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignUpPage", () => {
  it("renders email, password and confirm password fields plus the submit button", () => {
    render(<SignUpPage />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create account/i }),
    ).toBeInTheDocument();
  });

  it("links back to the sign-in page", () => {
    render(<SignUpPage />);

    const signInLink = screen.getByRole("link", { name: "Sign in" });
    expect(signInLink).toHaveAttribute("href", "/sign-in");
  });

  it("enforces type and minLength constraints on the password inputs", () => {
    render(<SignUpPage />);

    const password = screen.getByPlaceholderText(
      "Password",
    ) as HTMLInputElement;
    const confirm = screen.getByPlaceholderText(
      "Confirm password",
    ) as HTMLInputElement;

    expect(password.type).toBe("password");
    expect(password.minLength).toBe(8);
    expect(confirm.type).toBe("password");
    expect(confirm.minLength).toBe(8);
  });

  it("shows 'Passwords do not match' when the two password fields differ", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "different456" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create account/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  it("calls signUpWithEmail with matching credentials on submit", async () => {
    mockSignUpWithEmail.mockResolvedValueOnce(undefined);
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create account/i }),
    );

    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith(
        "alice@example.com",
        "password123",
      );
    });
  });

  it("renders the 'Check your email' success state after a successful sign-up", async () => {
    mockSignUpWithEmail.mockResolvedValueOnce(undefined);
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create account/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows an error message when signUpWithEmail throws", async () => {
    mockSignUpWithEmail.mockRejectedValueOnce(
      new Error("Email already registered"),
    );
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create account/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("disables the submit button while signing up", async () => {
    let resolveSignUp: () => void = () => {};
    mockSignUpWithEmail.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSignUp = resolve;
        }),
    );
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Create account/i }),
    );

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Creating account/i });
      expect(btn).toBeDisabled();
    });

    resolveSignUp();
  });
});
