import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, expectNoHorizontalScroll } from "./a11y";

test.describe("marketing pages", () => {
  test("home page has SEO basics and no accessibility violations", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lumen/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Know your site is down before your users do.");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /uptime|alerts/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "[]");
    expect(jsonLd.map((item: { "@type": string }) => item["@type"])).toEqual(["SoftwareApplication", "FAQPage"]);

    await expectNoA11yViolations(page);
    await expectNoHorizontalScroll(page);
  });

  test("dark mode passes accessibility checks too", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expectNoA11yViolations(page);
  });

  test("pricing switches between monthly and yearly", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByTestId("price-pro")).toHaveText("$12");
    await page.getByText(/Yearly/).click();
    await expect(page.getByTestId("price-pro")).toHaveText("$10");
    await expectNoA11yViolations(page);
    await expectNoHorizontalScroll(page);
  });

  test("skip link moves focus to the main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard flow");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("robots and sitemap are served", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /dashboard");
    expect(robots).toContain("Sitemap:");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/pricing");
  });
});
