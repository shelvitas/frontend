import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the homepage title", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Frontend Starter Kit" }),
    ).toBeVisible();
  });

});
