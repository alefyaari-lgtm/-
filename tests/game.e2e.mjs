import test, { before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const url = process.env.E2E_URL ?? 'http://127.0.0.1:4173';
const key = 'noorak_brightland_save_v1';
const id = 'case_01_silent_fountain';
let browser, server, context, page, errors;
const button = (name) => page.getByRole('button', { name, exact: true });
const saved = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
const progress = async () => (await saved()).cases[id];
const until = async (fn) => { for (let i = 0; i < 100; i++) { if (await fn()) return; await new Promise(r => setTimeout(r, 50)); } throw new Error('Condition timed out'); };
const phase = (value) => until(async () => (await progress())?.phase === value);
const visible = (locator) => locator.waitFor({ state: 'visible' });
const tap = (name) => button(name).tap();
async function canvasPoint(x, y) {
  const box = await page.locator('canvas').boundingBox();
  assert.ok(box?.width > 0);
  return { x: box.x + x * box.width / 1280, y: box.y + y * box.height / 720 };
}
async function canvasTap(x, y) { const point = await canvasPoint(x, y); await page.touchscreen.tap(point.x, point.y); }
async function seed(value) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, id, value }) => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 1, audio: { muted: true, volume: 0.7 }, unlockedRewardIds: [],
    cases: { [id]: { caseId: id, phase: value, introStepIndex: value === 'intro' ? 1 : 3,
      discoveredClueIds: ['hypothesis', 'fix', 'resolved'].includes(value) ? ['basin_low', 'valve_closed', 'pipe_intact'] : [],
      inspectedPropIds: [], selectedHypothesisId: ['fix','resolved'].includes(value) ? 'hyp_valve_closed' : null,
      selectedEvidenceIds: ['fix','resolved'].includes(value) ? ['valve_closed'] : [],
      reasoningAttempts: 0, hintsUsedCount: 0, maxHintLevelUsed: 0,
      fountainFixed: value === 'resolved', completedAtIso: value === 'resolved' ? '2026-11-15T10:00:00.000Z' : null,
    } },
  })), { key, id, value });
  await page.goto(`${url}/?autostart=1`, { waitUntil: 'domcontentloaded' });
  await visible(page.locator('canvas'));
  await phase(value);
}

before(async () => {
  if (!process.env.E2E_URL) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Preview server startup timed out')), 15000);
      let output = '';
      server.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('http://127.0.0.1:4173')) { clearTimeout(timer); resolve(); }
      });
      server.stderr.on('data', (data) => { output += data.toString(); });
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Preview exited (${code}): ${output}`)); });
    });
  }
  const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); server?.kill(); });
beforeEach(async () => {
  errors = [];
  context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(20000);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`${msg.text()} (${msg.location().url})`); });
});
afterEach(async () => { await context.close(); assert.deepEqual(errors, [], 'browser JS/console errors'); });

test('complete case using real Canvas touch, wrong answer, hint, notebook, valve and rewards', async () => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await button('شروع پرونده').focus();
  await page.keyboard.press('Enter');
  await visible(button('ادامه'));
  await tap('ادامه'); await tap('ادامه'); await tap('شروع جست‌وجو');
  await phase('explore');
  await canvasTap(290, 505);
  await until(async () => (await progress()).inspectedPropIds.includes('flowerpot'));
  await canvasTap(600, 510);
  await visible(button('ثبت در دفترچه و ادامه'));
  // Tap through the discovery overlay at another scene object: must not find it.
  await canvasTap(985, 466);
  assert.deepEqual((await progress()).discoveredClueIds, ['basin_low']);
  await tap('ثبت در دفترچه و ادامه');
  await canvasTap(985, 466); await tap('ثبت در دفترچه و ادامه');
  await page.getByRole('button', { name: /^دفترچه کارآگاهی/ }).tap();
  await visible(page.getByRole('dialog'));
  await tap('بستن دفترچه');
  await canvasTap(825, 492); await tap('ثبت در دفترچه و ادامه');
  await phase('hypothesis');
  const beforeOverlayTap = await progress();
  await canvasTap(155, 442);
  assert.deepEqual(await progress(), beforeOverlayTap, 'hypothesis backdrop must block Canvas touch');
  const hyp = page.getByRole('dialog').filter({ has: page.locator('#hypothesis-title') });
  await hyp.getByRole('button', { name: /لوله آب شکسته است/ }).tap();
  await hyp.getByRole('button', { name: /لوله سالم/ }).tap();
  await tap('بررسی پاسخ');
  assert.equal((await progress()).reasoningAttempts, 1);
  await hyp.getByRole('button', { name: 'راهنمای نورک', exact: true }).tap();
  await visible(page.getByRole('dialog', { name: 'راهنمای نورک', exact: true }));
  await tap('راهنمای ۳ · نشان‌دادن محل');
  await tap('بستن راهنما');
  await visible(hyp);
  assert.match(await hyp.getByRole('button', { name: /لوله آب شکسته است/ }).getAttribute('class'), /bg-teal-50/);
  assert.match(await hyp.getByRole('button', { name: /لوله سالم/ }).getAttribute('class'), /bg-amber-50/);
  await tap('بررسی دوباره دفترچه'); await tap('بستن دفترچه');
  await hyp.getByRole('button', { name: /شیر مسیر آب بسته است/ }).tap();
  await tap('بررسی پاسخ'); // correct hypothesis but missing primary evidence
  assert.equal((await progress()).phase, 'hypothesis');
  await hyp.getByRole('button', { name: /شیر آب بسته/ }).tap();
  await tap('بررسی پاسخ'); await phase('fix');
  await tap('بیایید شیر آب را باز کنیم!');
  await canvasTap(985, 466);
  for (let i = 0; i < 4; i++) await tap('چرخاندن شیر آب');
  await phase('resolved');
  await tap('ادامه'); await tap('مشاهده پاداش پرونده');
  await visible(button('بازگشت به صفحه اصلی'));
  const rewards = (await saved()).unlockedRewardIds;
  assert.equal(rewards.length, 2); assert.equal(new Set(rewards).size, 2);
  await tap('بازگشت به صفحه اصلی');
  await page.reload();
  await page.keyboard.press('Enter');
  await phase('resolved');
  await tap('نمایش پاداش پرونده');
  assert.deepEqual((await saved()).unlockedRewardIds, rewards);
});

for (const value of ['intro', 'explore', 'hypothesis', 'fix', 'resolved']) {
  test(`real browser reload and playable continuation from ${value}`, async () => {
    await seed(value);
    await page.reload(); await visible(page.locator('canvas')); await phase(value);
    if (value === 'intro') { await tap('ادامه'); await tap('شروع جست‌وجو'); await phase('explore'); }
    if (value === 'explore') { await canvasTap(600, 510); await visible(button('ثبت در دفترچه و ادامه')); }
    if (value === 'hypothesis') { await tap('حدس علت مشکل'); await visible(button('بررسی پاسخ')); }
    if (value === 'fix') { await canvasTap(985, 466); await visible(button('چرخاندن شیر آب')); }
    if (value === 'resolved') { await tap('نمایش پاداش پرونده'); await visible(button('بازی مجدد')); }
  });
}

test('draft survives pause, notebook and reload before submitting', async () => {
  await seed('hypothesis'); await tap('حدس علت مشکل');
  await page.getByRole('button', { name: /لوله آب شکسته است/ }).tap();
  await page.getByRole('button', { name: /لوله سالم/ }).tap();
  await page.keyboard.press('p'); await visible(button('ادامه بازی'));
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('[role=dialog]'))), true);
  }
  await page.keyboard.press('Escape'); await visible(button('بررسی پاسخ'));
  await page.reload(); await tap('حدس علت مشکل');
  assert.match(await page.getByRole('button', { name: /لوله آب شکسته است/ }).getAttribute('class'), /bg-teal-50/);
  assert.match(await page.getByRole('button', { name: /لوله سالم/ }).getAttribute('class'), /bg-amber-50/);
});

test('cancelled valve timer cannot finish after close, pause, exit or restart', async () => {
  for (const action of ['close', 'pause', 'exit', 'restart']) {
    await seed('fix'); await canvasTap(985, 466);
    // Four synchronous clicks schedule completion without consuming 420ms in touch gesture delays.
    await button('چرخاندن شیر آب').evaluate((el) => { for (let i = 0; i < 4; i++) el.click(); });
    // React batches same-tick clicks, so finish remaining actual turns if needed.
    for (let i = 0; i < 3; i++) await button('چرخاندن شیر آب').click();
    if (action === 'close') await button('بستن پنجره شیر آب').click();
    else {
      await page.keyboard.press('p');
      if (action === 'exit') await button('بازگشت به صفحه اصلی').click();
      if (action === 'restart') await button('شروع دوباره پرونده').click();
    }
    await page.waitForTimeout(550);
    assert.equal((await progress()).phase, action === 'restart' ? 'intro' : 'fix');
    assert.deepEqual((await saved()).unlockedRewardIds, []);
  }
});

test('keyboard shortcuts, pause blocks Canvas touch, audio settings and exit continue', async () => {
  await seed('explore');
  await page.keyboard.press('m');
  assert.equal((await saved()).audio.muted, false);
  await page.keyboard.press('p'); await visible(button('ادامه بازی'));
  await canvasTap(985, 466);
  assert.deepEqual((await progress()).discoveredClueIds, []);
  const slider = page.getByRole('slider'); await slider.focus(); await page.keyboard.press('ArrowLeft');
  await tap('ادامه بازی');
  await page.getByRole('button', { name: 'بررسی حوض فواره', exact: true }).focus();
  await page.keyboard.press('Enter'); await visible(button('ثبت در دفترچه و ادامه'));
  await tap('ثبت در دفترچه و ادامه');
  await page.keyboard.press('p'); await tap('بازگشت به صفحه اصلی');
  await page.keyboard.press('Enter');
  assert.deepEqual((await progress()).discoveredClueIds, ['basin_low']);
});

test('portrait, landscape and desktop resize preserve hit testing; hint blocks touches', async () => {
  await seed('explore');
  for (const viewport of [{ width:390, height:844 }, { width:844, height:390 }, { width:1440, height:900 }]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(150);
    await page.getByRole('button', { name: /^دفترچه کارآگاهی/ }).tap();
    await canvasTap(985, 466);
    assert.ok(!(await progress()).discoveredClueIds.includes('valve_closed'));
    await tap('بستن دفترچه');
    await canvasTap(600, 510);
    await visible(page.getByRole('dialog').getByRole('button').last());
    assert.deepEqual((await progress()).discoveredClueIds, ['basin_low']);
    await page.getByRole('dialog').getByRole('button').last().tap();
  }
  await tap('راهنمای نورک'); await tap('راهنمای ۳ · نشان‌دادن محل');
  await canvasTap(985, 466); assert.deepEqual((await progress()).discoveredClueIds, ['basin_low']);
  await tap('بستن راهنما'); await canvasTap(985, 466);
  await visible(button('ثبت در دفترچه و ادامه'));
});

test('broken save and denied storage still render usable game', async () => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => localStorage.setItem(key, '{bad'), key);
  await page.goto(`${url}/?autostart=1`, { waitUntil: 'domcontentloaded' }); await visible(button('ادامه'));
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }));
  await page.reload(); await visible(button('ادامه')); await tap('ادامه');
});
