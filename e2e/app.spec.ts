import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display featured tools', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveTitle(/Altruismo/);
    await expect(page.locator('h1')).toContainText(/Altruismo|Herramientas/);
    await expect(page.locator('text=DESTACADOS')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('nav')).toBeVisible();
    await page.click('text=Feed');
    await expect(page).toHaveURL(/.*feed/);
  });

  test('should display tools in grid', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('[data-testid="tool-card"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Login Page', () => {
  test('should display login options', async ({ page }) => {
    await page.goto('/es/login');
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
  });

  test('should redirect to feed after successful login', async ({ page }) => {
    await page.goto('/es/login');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Tool Page', () => {
  const toolId = '4af5e01f-cef8-4d58-a0d8-90c8a20fbf33';

  test('should load tool page with iframe preview', async ({ page }) => {
    await page.goto(`/es/page/${toolId}`);
    await expect(page.locator('iframe')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('iframe')).toHaveAttribute('src', /blob:|data:/);
  });

  test('should have open in new tab button', async ({ page }) => {
    await page.goto(`/es/page/${toolId}`);
    const newTabBtn = page.locator('button[title="Abrir en nueva pestaña"]');
    await expect(newTabBtn).toBeVisible();
  });

  test('should have fullscreen/popup button', async ({ page }) => {
    await page.goto(`/es/page/${toolId}`);
    const popupBtn = page.locator('button[title="Abrir en ventana grande"]');
    await expect(popupBtn).toBeVisible();
  });

  test('should switch between tool, source, and comments tabs', async ({ page }) => {
    await page.goto(`/es/page/${toolId}`);
    await expect(page.locator('button:has-text("Herramienta")')).toBeVisible();
    await expect(page.locator('button:has-text("Código")')).toBeVisible();
    await expect(page.locator('button:has-text("Comentarios")')).toBeVisible();

    await page.click('button:has-text("Código")');
    await expect(page.locator('pre code')).toBeVisible();

    await page.click('button:has-text("Comentarios")');
    await expect(page.locator('text=Comentarios')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/es/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Profile Page', () => {
  test('should display user profile', async ({ page }) => {
    await page.goto('/es/profile/9767656b-dee1-4fe3-880b-866dfdade98e');
    await expect(page.locator('text=Chat RR aliados')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Mis herramientas')).toBeVisible();
  });
});

test.describe('Upload Tool', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/es/upload');
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/es');
    const headings = await page.locator('h1, h2, h3').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/es');
    const violacions = await page.evaluate(async () => {
      const { default: axe } = await import('axe-core');
      const results = await axe.run();
      return results.violations.filter(v => v.id.includes('color-contrast'));
    });
    expect(violacions).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/es');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});

test.describe('Performance', () => {
  test('should load home page within budget', async ({ page }) => {
    const start = Date.now();
    await page.goto('/es', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load tool page within budget', async ({ page }) => {
    const toolId = '4af5e01f-cef8-4d58-a0d8-90c8a20fbf33';
    const start = Date.now();
    await page.goto(`/es/page/${toolId}`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });
});