/**
 * E2E: Auth flow (navbar CTA, pricing Founder CTA, intent storage).
 *
 * TEST 3A + 3B: Intent routing is tested via unit tests in
 *   tests/unit/auth-intent-routing.test.js (and src/lib/auth/__tests__/auth-intent-routing.test.js).
 *
 * E2E coverage of redirect-after-magic-link requires a real magic link click.
 * To run manually:
 *   1. Click "Get Started" / "Start free" in navbar
 *   2. Enter real email address
 *   3. Click magic link from email
 *   4. Verify redirect lands on /dashboard
 *
 * For paid flow:
 *   1. Click Founder Plan CTA on pricing
 *   2. Enter real email
 *   3. Click magic link from email
 *   4. Verify redirect lands on /checkout
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const AUTH_INTENT_KEY = 'centurion_auth_intent';

test.describe('Auth flow — intent storage before auth', () => {
  test('TEST 3C — intent is stored correctly before auth (signin)', async ({ page }) => {
    await page.goto(BASE_URL);

    // Step 2: Click "Get Started" / navbar CTA
    await page.getByTestId('navbar-cta').click();

    // Step 3: Before entering email, read localStorage
    const intentJson = await page.evaluate((key) => localStorage.getItem(key), AUTH_INTENT_KEY);
    expect(intentJson).toBeTruthy();

    // Step 4: Assert centurion_auth_intent exists (already done above)
    const intent = JSON.parse(intentJson);
    expect(intent).toHaveProperty('redirectTo', '/dashboard');

    // Step 6: Close modal without submitting
    await page.getByRole('button', { name: /close|dismiss/i }).first().click().catch(() => {});
  });

  test('TEST 3D — paid intent is stored correctly before auth', async ({ page }) => {
    await page.goto(BASE_URL);

    // Step 2: Scroll to pricing section
    await page.locator('[data-testid="pricing-section"]').scrollIntoViewIfNeeded();

    // Step 3: Click Founder Plan CTA
    await page.getByTestId('pricing-founder-cta').click();

    // Step 4: Before entering email, read localStorage
    const intentJson = await page.evaluate((key) => localStorage.getItem(key), AUTH_INTENT_KEY);
    expect(intentJson).toBeTruthy();

    const intent = JSON.parse(intentJson);
    expect(intent).toMatchObject({
      intent: 'upgrade',
      plan: 'founder',
      redirectTo: '/checkout',
    });

    // Step 7: Close modal without submitting
    await page.getByRole('button', { name: /close|dismiss/i }).first().click().catch(() => {});
  });
});
