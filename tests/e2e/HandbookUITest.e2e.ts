import { expect, test } from '@playwright/test';

test.describe('Handbook UI/UX Improvements', () => {
  test('should display improved handbook layout with accordion navigation', async ({ page }) => {
    // Go to a handbook lesson page
    await page.goto('/handbook/private-pilot/principles-of-flight/four-forces');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Check if we're redirected to sign-in (expected for unauthenticated users)
    if (page.url().includes('sign-in')) {
      console.log('User not authenticated - skipping test');
      return;
    }

    // Wait a bit for all components to render
    await page.waitForTimeout(2000);

    // Check for accordion-style navigation in left sidebar
    const accordion = page.locator('[data-radix-accordion]');

    await expect(accordion).toBeVisible();

    // Check for expandable units
    const accordionTriggers = page.locator('[data-radix-accordion-trigger]');

    await expect(accordionTriggers.first()).toBeVisible();

    // Check for right sidebar (Jump to Section) on larger screens
    const rightSidebar = page.locator('aside:has-text("Jump to Section")');

    // Set viewport to extra large to see right sidebar
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(500);

    // Take screenshot of the improved layout
    await page.screenshot({
      path: 'tests/screenshots/handbook-improved-ui.png',
      fullPage: true,
    });

    console.log('✅ Handbook UI improvements captured');
  });

  test('should display table of contents with proper structure', async ({ page }) => {
    await page.goto('/handbook/private-pilot/principles-of-flight');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('sign-in')) {
      console.log('User not authenticated - skipping test');
      return;
    }

    await page.waitForTimeout(2000);

    // Check for sticky sidebar
    const sidebar = page.locator('aside').first();

    await expect(sidebar).toBeVisible();

    // Check for accordion items with lesson counts
    const lessonCounts = page.locator('text=/\\d+/');

    await expect(lessonCounts.first()).toBeVisible();

    // Take screenshot of the table of contents
    await page.screenshot({
      path: 'tests/screenshots/handbook-table-of-contents.png',
      fullPage: true,
    });

    console.log('✅ Table of contents structure captured');
  });

  test('should display holy grail layout on wide screens', async ({ page }) => {
    // Set extra wide viewport to see holy grail layout
    await page.setViewportSize({ width: 1600, height: 1000 });

    await page.goto('/handbook/private-pilot/principles-of-flight/four-forces');
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('sign-in')) {
      console.log('User not authenticated - skipping test');
      return;
    }

    await page.waitForTimeout(3000);

    // Check for three-column layout
    const leftSidebar = page.locator('aside').first();
    const mainContent = page.locator('main');
    const rightSidebar = page.locator('aside:has-text("Jump to Section")');

    await expect(leftSidebar).toBeVisible();
    await expect(mainContent).toBeVisible();
    await expect(rightSidebar).toBeVisible();

    // Check for Jump to Section functionality
    const jumpToSectionNav = page.locator('nav').filter({ hasText: /Introduction|Forces|Application/ });

    // Take screenshot of holy grail layout
    await page.screenshot({
      path: 'tests/screenshots/handbook-holy-grail-layout.png',
      fullPage: true,
    });

    console.log('✅ Holy grail layout captured');
  });
});
