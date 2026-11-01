import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, expectNoHorizontalScroll } from "./a11y";

test.describe("dashboard", () => {
  test("redirects signed-out visitors to sign-in", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard%2Fbilling/);
    await expectNoA11yViolations(page);
  });

  test("demo account can sign in, see the Free plan and sign out", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("button", { name: "Continue with the demo account" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Welcome back, Demo");
    await expect(page.getByTestId("current-plan")).toContainText("Free");
    await expect(page.getByTestId("insights-locked")).toBeVisible();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    await expectNoA11yViolations(page);
    await expectNoHorizontalScroll(page);

    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/dashboard\/billing$/);
    await expect(page.getByRole("link", { name: "Billing" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("billing-plan")).toContainText("Free");
    // No Stripe keys in this run, so upgrades are switched off and say why.
    await expect(page.getByText("Stripe keys are not set on this deployment")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade to Pro, billed monthly" })).toBeDisabled();
    await expectNoA11yViolations(page);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in keeps the page you were going to", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await page.getByRole("button", { name: "Continue with the demo account" }).click();
    await expect(page).toHaveURL(/\/dashboard\/billing$/);
  });

  test("a forged next parameter cannot redirect off-site", async ({ page }) => {
    await page.goto("/sign-in?next=//evil.example");
    await page.getByRole("button", { name: "Continue with the demo account" }).click();
    await expect(page).toHaveURL(/localhost:3100\/dashboard$/);
  });
});
