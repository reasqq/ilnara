import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const folder = resolve(process.env.CAPTURE_DIR || 'test-results/screenshots');
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 393, height: 873 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
await page.goto('http://127.0.0.1:5173/ilnara/');
for (let i = 1; i <= 5; i++) {
  await page.waitForSelector(`main[data-scene="${i}"][data-phase="idle"]`);
  await page.screenshot({ path: resolve(folder, `mobile-${i}.png`) });
  if (i < 5) await page.getByRole('button').click();
}
await page.setViewportSize({ width: 1920, height: 1080 });
await page.waitForTimeout(500);
await page.screenshot({ path: resolve(folder, 'desktop-final.png') });
await page.setViewportSize({ width: 800, height: 360 });
await page.waitForTimeout(500);
await page.screenshot({ path: resolve(folder, 'landscape-final.png') });
await page.setViewportSize({ width: 1200, height: 630 });
await page.addStyleTag({ content: '.glass-button,.scene-progress{display:none!important}.wordmark{top:30px}.wordmark span{display:none}.scene-copy{top:65%}.chapter-label{font-size:10px;margin-bottom:12px}.scene-copy--5 h1{font-size:38px}.canvas-container{transform:translateY(-20px)}' });
await page.locator('.text-line').first().evaluate(el => { el.textContent = 'Для тебя,'; });
await page.waitForTimeout(800);
await page.screenshot({ path: resolve('public/og-cover.png') });
console.log('Screenshots saved:', folder);
console.log(await page.locator('main').evaluate(e => ({ renderer: e.dataset.renderer, quality: e.querySelector('.canvas-container')?.dataset.quality })));
await browser.close();
