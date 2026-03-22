import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test("should display sign in form", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should display Google OAuth button", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(
      page.getByRole("button", { name: /Continue with Google/ }),
    ).toBeVisible();
  });

  test("should have link to sign up page", async ({ page }) => {
    await page.goto("/sign-in");

    const signUpLink = page.getByRole("link", { name: "Sign up" });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should have link to forgot password page", async ({ page }) => {
    await page.goto("/sign-in");

    const forgotLink = page.getByRole("link", {
      name: "Forgot your password?",
    });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByPlaceholder("Email").fill("bad@example.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should show an error message (Supabase returns invalid credentials)
    await expect(page.getByText(/Invalid|invalid|error/i)).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Sign Up Page", () => {
  test("should display sign up form", async ({ page }) => {
    await page.goto("/sign-up");

    await expect(
      page.getByRole("heading", { name: "Create your account" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(
      page.getByPlaceholder("Password", { exact: true }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Confirm password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("should display Google OAuth button", async ({ page }) => {
    await page.goto("/sign-up");

    await expect(
      page.getByRole("button", { name: /Continue with Google/ }),
    ).toBeVisible();
  });

  test("should have link to sign in page", async ({ page }) => {
    await page.goto("/sign-up");

    const signInLink = page.getByRole("link", { name: "Sign in" });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should show error when passwords do not match", async ({ page }) => {
    await page.goto("/sign-up");

    await page.getByPlaceholder("Email").fill("test@example.com");
    await page
      .getByPlaceholder("Password", { exact: true })
      .fill("password123");
    await page.getByPlaceholder("Confirm password").fill("different123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});

test.describe("Forgot Password Page", () => {
  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(
      page.getByRole("heading", { name: "Reset your password" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send reset link" }),
    ).toBeVisible();
  });

  test("should have link back to sign in", async ({ page }) => {
    await page.goto("/forgot-password");

    const backLink = page.getByRole("link", { name: "Back to sign in" });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Protected Routes", () => {
  test("should redirect /profile to /sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/profile");

    // Should end up on sign-in (either via middleware or client-side redirect)
    await page.waitForURL(/\/sign-in/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/sign-in/);
  });

  // TODO: Add redirect tests for /library, /feed, /settings when those pages
  // are built under the (protected) route group
});

test.describe("Public Routes", () => {
  test("should load home page without auth", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    // Page should load without redirecting
    expect(page.url()).not.toContain("/sign-in");
  });

  test("should load sign-in page without auth", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should load sign-up page without auth", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });
});
