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

const mockUpdatePassword = vi.fn();

vi.mock("@/lib/hooks/use-auth", () => ({
  useAuth: () => ({
    updatePassword: mockUpdatePassword,
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

const ResetPasswordPageModule = await import("@/app/(auth)/reset-password/page");
const ResetPasswordPage = ResetPasswordPageModule.default;

// Stub window.location so the successful update doesn't actually navigate.
const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();

  // Replace location with a writable mock
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...originalLocation, href: "" },
  });
});

describe("ResetPasswordPage", () => {
  it("renders the heading, both password fields, and the submit button", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Set new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("New password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm new password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update password/i }),
    ).toBeInTheDocument();
  });

  it("enforces the minLength and type constraints on the password inputs", () => {
    render(<ResetPasswordPage />);

    const password = screen.getByPlaceholderText(
      "New password",
    ) as HTMLInputElement;
    const confirm = screen.getByPlaceholderText(
      "Confirm new password",
    ) as HTMLInputElement;

    expect(password.type).toBe("password");
    expect(password.minLength).toBe(8);
    expect(confirm.type).toBe("password");
    expect(confirm.minLength).toBe(8);
  });

  it("shows 'Passwords do not match' when the fields differ", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "different456" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Update password/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it("calls updatePassword with the new password and navigates on success", async () => {
    mockUpdatePassword.mockResolvedValueOnce(undefined);
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Update password/i }),
    );

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith("newPassword123");
    });
    await waitFor(() => {
      expect(window.location.href).toBe("/profile");
    });
  });

  it("shows the error message when updatePassword throws", async () => {
    mockUpdatePassword.mockRejectedValueOnce(new Error("Token expired"));
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Update password/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
  });

  it("shows a fallback error message when a non-Error is thrown", async () => {
    mockUpdatePassword.mockRejectedValueOnce("boom");
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Update password/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to update password")).toBeInTheDocument();
    });
  });

  it("disables the submit button while the update is in flight", async () => {
    let resolveUpdate: () => void = () => {};
    mockUpdatePassword.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Update password/i }),
    );

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Updating/i });
      expect(btn).toBeDisabled();
    });

    resolveUpdate();
  });
});
