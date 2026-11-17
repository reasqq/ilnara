import { test, expect, type Page } from '@playwright/test';

async function idle(page: Page, scene: number) {
  await expect(page.locator('main')).toHaveAttribute('data-scene', String(scene));
  await expect(page.locator('main')).toHaveAttribute('data-phase', 'idle');
  await expect(page.getByRole('button')).toBeEnabled();
}

test('five scenes, double taps, keyboard and three repeat cycles', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await idle(page, 1);
  await expect(page.locator('main')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('main').click({ position: { x: 20, y: 200 } });
  await expect(page.locator('main')).toHaveAttribute('data-scene', '1');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const initialHeap = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let s = 1; s <= 5; s++) {
      await idle(page, s);
      await expect(page.getByRole('heading')).toBeVisible();
      await page.getByRole('button').evaluate((el: HTMLButtonElement) => { el.click(); el.click(); });
      await idle(page, s === 5 ? 1 : s + 1);
      await expect(page.locator('canvas')).toHaveCount(1);
    }
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const finalHeap = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  expect(finalHeap - initialHeap).toBeLessThan(8 * 1024 * 1024);
  await page.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await idle(page, 2);
  expect(errors).toEqual([]);
});

test('layout matrix and orientation changes keep all content within the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  for (const [width, height] of [[320,568],[360,800],[393,873],[412,915],[568,320],[800,360],[873,393],[1366,768],[1920,1080],[2560,1080]]) {
    await page.setViewportSize({ width, height });
    for (let s = 1; s <= 5; s++) {
      await idle(page, s);
      const box = await page.getByRole('button').boundingBox();
      const heading = await page.getByRole('heading').boundingBox();
      const progress = await page.locator('.scene-progress').boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThan(progress!.y);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(heading!.x).toBeGreaterThanOrEqual(0);
      expect(heading!.x + heading!.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBeTruthy();
      await page.getByRole('button').click();
    }
    await idle(page, 1);
  }
});

test('unavailable WebGL has a complete reduced-motion story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('./');
  await expect(page.locator('main')).toHaveAttribute('data-renderer', 'fallback');
  for (let s = 1; s <= 5; s++) {
    await idle(page, s);
    expect(await page.locator('.fallback-art img').first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBeTruthy();
    await page.getByRole('button').click();
  }
  await idle(page, 1);
});

test('context loss switches to usable fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await idle(page, 1);
  await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(page.locator('main')).toHaveAttribute('data-renderer', 'fallback');
  await page.getByRole('button').click();
  await idle(page, 2);
});

test('production metadata, local fonts and direct refresh', async ({ page, request, baseURL }) => {
  const external: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on('request', r => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) external.push(r.url()); });
  await page.goto('./');
  await idle(page, 1);
  await page.reload();
  await idle(page, 1);
  await expect(page).toHaveTitle('Для тебя, Ильнарочка ❤️');
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toMatch(/^https:\/\/.+\/og-cover.png$/);
  const cover = await request.get('./og-cover.png');
  expect(cover.ok()).toBeTruthy();
  expect(external).toEqual([]);
});
