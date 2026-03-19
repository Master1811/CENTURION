const { test, expect } = require("@playwright/test");
const fs = require("fs");

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const OUT_DIR = "tests/screenshots/auth-flow/test-access";

function pathJoin(...parts) {
  // Keep paths platform-safe (Windows runners)
  return parts.join("/").replaceAll("//", "/");
}

test.describe("Access gate screenshots", () => {
  test("TEST 4 — unauthenticated /dashboard redirects to /", async ({ page }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: pathJoin(OUT_DIR, "test4-unauth-dashboard.png"),
      fullPage: true,
    });

    const finalPath = new URL(page.url()).pathname;
    // Expect landing page at root.
    expect(finalPath).toBe("/");

    // Keep strict: no console errors expected during gate redirect.
    expect(consoleErrors.length).toBe(0);
  });

  test("TEST 5 — /pricing route loads correctly", async ({ page }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });

    await expect(page.locator('[data-testid="pricing-section"]').first()).toBeVisible({
      timeout: 5000,
    });

    await page.screenshot({
      path: pathJoin(OUT_DIR, "test5-pricing.png"),
      fullPage: true,
    });
  });

  test("TEST 6 — no regressions: console errors + calculator gate", async ({
    page,
  }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: pathJoin(OUT_DIR, "test6-home.png"),
      fullPage: true,
    });

    expect(consoleErrors.length).toBe(0);

    await page.goto(`${BASE_URL}/tools/100cr-calculator`, {
      waitUntil: "networkidle",
    });

    // Unauthenticated users should see the ResultGate overlay.
    await expect(page.locator('text=YOUR TRAJECTORY IS READY').first()).toBeVisible({
      timeout: 5000,
    });

    await page.screenshot({
      path: pathJoin(OUT_DIR, "test6-calculator-gate.png"),
      fullPage: true,
    });
  });
});

