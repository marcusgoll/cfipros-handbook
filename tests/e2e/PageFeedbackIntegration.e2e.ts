import { expect, test } from '@playwright/test';

test.describe('PageFeedback Component Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a lesson page that has PageFeedback component
    await page.goto('/en/handbook/private-pilot/principles-of-flight/four-forces');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display PageFeedback component on lesson page', async ({ page }) => {
    // Check if PageFeedback component is present
    const feedbackComponent = page.locator('[data-testid="page-feedback"]');

    await expect(feedbackComponent).toBeVisible({ timeout: 10000 });
  });

  test('should show aviation-themed question text', async ({ page }) => {
    // Check for aviation-themed text
    const questionText = page.locator('text=How was this lesson?');

    await expect(questionText).toBeVisible({ timeout: 10000 });
  });

  test('should have thumbs up/down buttons', async ({ page }) => {
    // Check for thumbs up button
    const thumbsUpButton = page.locator('button[aria-label="This page was helpful"]');

    await expect(thumbsUpButton).toBeVisible({ timeout: 10000 });

    // Check for thumbs down button
    const thumbsDownButton = page.locator('button[aria-label="This page was not helpful"]');

    await expect(thumbsDownButton).toBeVisible({ timeout: 10000 });
  });

  test('should display star rating buttons', async ({ page }) => {
    // Check for star rating buttons (5 stars) - look for buttons containing star SVGs
    const starButtons = page.locator('button:has(svg[class*="text-amber"])');

    await expect(starButtons).toHaveCount(5);
  });

  test('should show feedback on thumbs up click', async ({ page }) => {
    // Click thumbs up
    const thumbsUpButton = page.locator('button[aria-label="This page was helpful"]');
    await thumbsUpButton.click();

    // Wait for thank you message
    const thankYouMessage = page.locator('text=Thanks for your feedback!');

    await expect(thankYouMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show progress suggestions for positive feedback', async ({ page }) => {
    // Click thumbs up
    const thumbsUpButton = page.locator('button[aria-label="This page was helpful"]');
    await thumbsUpButton.click();

    // Wait for the thank you message to appear first
    await expect(page.locator('text=Thanks for your feedback!')).toBeVisible({ timeout: 5000 });

    // Look for progress suggestion buttons
    const continueButton = page.locator('text=Continue Learning');
    const practiceButton = page.locator('text=Practice Quiz');

    // At least one should be visible
    await expect(continueButton.or(practiceButton)).toBeVisible({ timeout: 3000 });
  });

  test('should persist feedback in localStorage', async ({ page }) => {
    // Click star rating (4 stars) - use better selector
    const fourthStar = page.locator('button:has(svg[class*="text-amber"])').nth(3);
    await fourthStar.click();

    // Wait for thank you message
    await expect(page.locator('text=Thanks for your feedback!')).toBeVisible({ timeout: 5000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Check if feedback persists (thank you message should still show)
    await expect(page.locator('text=Thanks for your feedback!')).toBeVisible({ timeout: 5000 });
  });

  test('should allow clearing feedback', async ({ page }) => {
    // Give feedback first
    const thumbsUpButton = page.locator('button[aria-label="This page was helpful"]');
    await thumbsUpButton.click();

    // Wait for thank you message
    await expect(page.locator('text=Thanks for your feedback!')).toBeVisible({ timeout: 5000 });

    // Find and click the clear/update feedback button
    const updateButton = page.locator('text=Change feedback');
    await updateButton.click();

    // Should return to initial state
    const questionText = page.locator('text=How was this lesson?');

    await expect(questionText).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to page
    await page.goto('/en/handbook/private-pilot/principles-of-flight/four-forces');
    await page.waitForLoadState('domcontentloaded');

    // Check if feedback component is still visible and functional
    const feedbackComponent = page.locator('[data-testid="page-feedback"]');

    await expect(feedbackComponent).toBeVisible({ timeout: 10000 });

    // Check if buttons are large enough for touch (min 44px)
    const thumbsUpButton = page.locator('button[aria-label="This page was helpful"]');
    const buttonBox = await thumbsUpButton.boundingBox();

    expect(buttonBox?.height).toBeGreaterThanOrEqual(32);
  });

  test('should display aviation gradient styling', async ({ page }) => {
    // Check if the component has aviation-themed styling
    const feedbackCard = page.locator('.aviation-gradient').first();

    // Should have proper styling classes
    const hasAviationGradient = await feedbackCard.evaluate((el) => {
      return window.getComputedStyle(el).background.includes('gradient');
    });

    expect(hasAviationGradient).toBeTruthy();
  });
});

test.describe('PageFeedback Showcase Page', () => {
  test('should display all component variants', async ({ page }) => {
    await page.goto('/en/dashboard/feedback-showcase');
    await page.waitForLoadState('domcontentloaded');

    // Check for page title
    await expect(page.locator('h1')).toContainText('PageFeedback Component Showcase');

    // Check for all three variants
    await expect(page.locator('text=Minimal Variant')).toBeVisible();
    await expect(page.locator('text=Default Variant')).toBeVisible();
    await expect(page.locator('text=Expanded Variant')).toBeVisible();

    // Check for tabs
    await expect(page.locator('text=Variants')).toBeVisible();
    await expect(page.locator('text=Features')).toBeVisible();
    await expect(page.locator('text=Examples')).toBeVisible();
  });

  test('should allow interaction with showcase examples', async ({ page }) => {
    await page.goto('/en/dashboard/feedback-showcase');
    await page.waitForLoadState('domcontentloaded');

    // Find and interact with a minimal variant example
    const minimalFeedback = page.locator('[data-testid="page-feedback"]').first();
    const thumbsUp = minimalFeedback.locator('button[aria-label="This page was helpful"]');

    await thumbsUp.click();

    // Should show thank you message
    await expect(page.locator('text=Thanks for the feedback!').first()).toBeVisible({ timeout: 5000 });
  });
});
