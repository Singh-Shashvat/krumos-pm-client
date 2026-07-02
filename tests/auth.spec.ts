import { test, expect } from '@playwright/test';

test.describe('Authentication & Workspace Routing Guards', () => {
  test('unauthenticated user accessing root should be redirected to login page', async ({
    page,
  }) => {
    // Navigate to root path
    await page.goto('/');

    // Check if browser redirected to login portal
    await expect(page).toHaveURL(/\/login/);

    // Check for login branding elements
    const logoLabel = page.locator('span:has-text("KRUMOS")');
    await expect(logoLabel).toBeVisible();
  });

  test('login page elements render correctly', async ({ page }) => {
    await page.goto('/login');

    // Confirm that the Google Sign-in action button exists
    const googleButton = page.locator(
      'button:has-text("SIGN IN WITH GOOGLE")'
    );
    await expect(googleButton).toBeVisible();
  });
});
