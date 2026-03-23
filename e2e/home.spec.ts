import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();
  });

  test("should display the CTA button", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /Get started/i }),
    ).toBeVisible();
  });

  test("should display the navbar with logo", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("img", { name: "Shelves" }),
    ).toBeVisible();
  });
});
