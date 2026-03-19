const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const OUT_DIR = 'tests/screenshots/auth-flow/test-onboarding';

test.describe('Onboarding visual checks', () => {
  test('TEST 5 — landing + /dashboard redirect + console errors', async ({
    page,
  }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${OUT_DIR}/test5-landing.png`,
      fullPage: true,
    });

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const finalPath = new URL(page.url()).pathname;

    await page.screenshot({
      path: `${OUT_DIR}/test5-dashboard-redirect.png`,
      fullPage: true,
    });

    expect(finalPath).toBe('/');
    expect(consoleErrors.length).toBe(0);
  });

  test('TEST 6 — calculator gate still present for anonymous users', async ({
    page,
  }) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    await page.goto(`${BASE_URL}/tools/100cr-calculator`, {
      waitUntil: 'networkidle',
    });

    await expect(page.locator('text=YOUR TRAJECTORY IS READY').first()).toBeVisible({
      timeout: 5000,
    });

    await page.screenshot({
      path: `${OUT_DIR}/test6-calculator-gate.png`,
      fullPage: true,
    });

    expect(consoleErrors.length).toBe(0);
  });
});

