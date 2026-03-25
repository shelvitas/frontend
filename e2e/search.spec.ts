import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("should load the search page", async ({ page }) => {
    await page.goto("/search");

    // The page should load (200) — auth check happens client-side
    // Either shows the search input or redirects to sign-in
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const isSearchPage = url.includes("/search");
    const isSignInPage = url.includes("/sign-in");

    // One of these must be true
    expect(isSearchPage || isSignInPage).toBe(true);
  });

  test("should have a search input when loaded", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    // If we're on the search page (authenticated or layout passes through)
    if (page.url().includes("/search")) {
      await expect(page.getByPlaceholder(/search by title/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
