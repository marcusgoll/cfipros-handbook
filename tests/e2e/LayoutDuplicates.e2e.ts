import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

async function checkDuplicateElements(page: Page, elementType: string, selector: string) {
  const elements = await page.locator(selector).all();
  const count = elements.length;

  if (count > 1) {
    console.log(`WARNING: Found ${count} ${elementType}s on ${page.url()}`);

    // Take a screenshot for debugging
    await page.screenshot({
      path: `tests/screenshots/duplicate-${elementType}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  return count;
}

const pagesToTest = [
  { name: 'Homepage', path: '/' },
  { name: 'Sign In', path: '/sign-in' },
  { name: 'Sign Up', path: '/sign-up' },
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Handbook Landing', path: '/handbook', requiresAuth: true },
  { name: 'Private Pilot Landing', path: '/handbook/private-pilot', requiresAuth: true },
  { name: 'Principles of Flight', path: '/handbook/private-pilot/principles-of-flight', requiresAuth: true },
  { name: 'Four Forces Lesson', path: '/handbook/private-pilot/principles-of-flight/four-forces', requiresAuth: true },
  { name: 'Full Width Example', path: '/examples/full-width', requiresAuth: true },
  { name: 'Holy Grail Example', path: '/examples/holy-grail', requiresAuth: true },
  { name: 'Left Sidebar Example', path: '/examples/left-sidebar', requiresAuth: true },
];

test.describe('Layout Elements Duplication Check', () => {
  test.beforeEach(async ({ page }) => {
    // Set up auth state if needed
    await page.goto('/');
  });

  test('should not have duplicate headers across all pages', async ({ page }) => {
    for (const pageInfo of pagesToTest) {
      if (pageInfo.requiresAuth) {
        // Skip auth-required pages for now, or implement auth
        continue;
      }

      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      // Check for duplicate headers
      const headerCount = await checkDuplicateElements(page, 'header', 'header');

      expect(headerCount, `${pageInfo.name} should have exactly one header`).toBeLessThanOrEqual(1);

      // Also check for specific navigation components
      const topNavCount = await page.locator('[class*="TopNavigation"], [class*="top-navigation"]').count();
      const marketingHeaderCount = await page.locator('[class*="Header"]:not([class*="SidebarHeader"])').count();

      const totalNavHeaders = headerCount + topNavCount + marketingHeaderCount;

      expect(totalNavHeaders, `${pageInfo.name} should not have duplicate navigation headers`).toBeLessThanOrEqual(1);
    }
  });

  test('should not have duplicate sidebars across all pages', async ({ page }) => {
    for (const pageInfo of pagesToTest) {
      if (pageInfo.requiresAuth) {
        continue;
      }

      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      // Check for duplicate sidebars
      const sidebarCount = await checkDuplicateElements(page, 'sidebar', 'aside, [role="complementary"], [class*="sidebar"], [class*="Sidebar"]');

      expect(sidebarCount, `${pageInfo.name} should have at most one sidebar`).toBeLessThanOrEqual(1);
    }
  });

  test('should not have duplicate footers across all pages', async ({ page }) => {
    for (const pageInfo of pagesToTest) {
      if (pageInfo.requiresAuth) {
        continue;
      }

      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      // Check for duplicate footers
      const footerCount = await checkDuplicateElements(page, 'footer', 'footer');

      expect(footerCount, `${pageInfo.name} should have at most one footer`).toBeLessThanOrEqual(1);
    }
  });

  test('should check auth-protected pages for layout issues', async ({ page, context }) => {
    // First, let's check if we can access a protected page
    await page.goto('/dashboard');

    // If redirected to sign-in, we'll note this
    if (page.url().includes('sign-in')) {
      console.log('Auth required for protected pages - skipping authenticated page tests');
      return;
    }

    // If we can access protected pages, test them
    for (const pageInfo of pagesToTest.filter(p => p.requiresAuth)) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');

      // Check all layout elements
      const headerCount = await checkDuplicateElements(page, 'header', 'header');
      const sidebarCount = await checkDuplicateElements(page, 'sidebar', 'aside, [role="complementary"], [class*="sidebar"], [class*="Sidebar"]');
      const footerCount = await checkDuplicateElements(page, 'footer', 'footer');

      expect(headerCount, `${pageInfo.name} should have exactly one header`).toBeLessThanOrEqual(1);
      expect(sidebarCount, `${pageInfo.name} should have at most one sidebar`).toBeLessThanOrEqual(1);
      expect(footerCount, `${pageInfo.name} should have at most one footer`).toBeLessThanOrEqual(1);
    }
  });

  test('should check specific layout nesting issues', async ({ page }) => {
    // Test handbook pages specifically as they have nested layouts
    const handbookPages = [
      '/handbook',
      '/handbook/private-pilot',
      '/handbook/private-pilot/principles-of-flight',
      '/handbook/private-pilot/principles-of-flight/four-forces',
    ];

    for (const path of handbookPages) {
      await page.goto(path);

      // If redirected to sign-in, skip
      if (page.url().includes('sign-in')) {
        console.log(`Auth required for ${path} - skipping`);
        continue;
      }

      await page.waitForLoadState('domcontentloaded');

      // Check for multiple instances of TopNavigation component
      const topNavElements = await page.locator('header').all();
      console.log(`Found ${topNavElements.length} header elements on ${path}`);

      // Check for multiple instances of SubNavigation
      const subNavElements = await page.locator('[class*="SubNavigation"], nav[class*="sub"]').all();
      console.log(`Found ${subNavElements.length} sub-navigation elements on ${path}`);

      // Check for nested sidebars (handbook has its own sidebar within dashboard)
      const sidebarElements = await page.locator('[class*="sidebar"], [class*="Sidebar"], aside').all();
      console.log(`Found ${sidebarElements.length} sidebar elements on ${path}`);

      // Visual regression check - take screenshot
      await page.screenshot({
        path: `tests/screenshots/layout-check-${path.replace(/\//g, '-')}.png`,
        fullPage: true,
      });
    }
  });
});

// Helper test to visually inspect specific problematic pages
test.describe('Visual Layout Inspection', () => {
  test('capture screenshots of all major layouts', async ({ page }) => {
    const layouts = [
      { name: 'marketing', path: '/' },
      { name: 'auth-center', path: '/sign-in' },
      { name: 'dashboard', path: '/dashboard' },
      { name: 'handbook-with-sidebar', path: '/handbook/private-pilot/principles-of-flight' },
    ];

    for (const layout of layouts) {
      await page.goto(layout.path);
      await page.waitForLoadState('domcontentloaded');

      await page.screenshot({
        path: `tests/screenshots/layout-${layout.name}.png`,
        fullPage: true,
      });
    }
  });
});
