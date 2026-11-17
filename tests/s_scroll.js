const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok' : 'FAIL', m); if (!c) f++; };
  await p.evaluate(() => { D().bills = Array.from({length: 30}, (_, i) => ({id: 'b' + i, name: 'Bill ' + i, amount: 10, dueDay: i % 28 + 1, type: 'Utilities', payer: 'both', paid: []})); go('money', 'Bills'); st.commitView = 'monthly'; st.billArrange = true; render(); });
  await p.waitForTimeout(200); await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(100);
  for (const [n, dir] of [[12, 'up'], [12, 'down'], [15, 'down']]) {
    const row = p.locator('#billArr .item').nth(n); const id = await row.getAttribute('data-id'); await row.scrollIntoViewIfNeeded();
    const y0 = await p.evaluate(() => scrollY), t0 = (await row.boundingBox()).y;
    await row.locator(`button[aria-label="Move ${dir}"]`).click(); await p.waitForTimeout(150);
    const y1 = await p.evaluate(() => scrollY), t1 = (await p.locator(`#billArr [data-id="${id}"]`).boundingBox()).y;
    ok(y1 > 500 && Math.abs(t1 - t0) < 2, `move ${dir}: page stays down (scroll ${y0}->${y1}), item stays under finger (${t0.toFixed(0)}->${t1.toFixed(0)})`);
  }
  // drag also keeps place
  const g = await p.locator('#billArr .item').nth(14).locator('.grip').boundingBox(); const y0 = await p.evaluate(() => scrollY);
  await p.mouse.move(g.x + 5, g.y + 5); await p.mouse.down(); for (let y = g.y; y < g.y + 160; y += 20) await p.mouse.move(g.x + 5, y); await p.mouse.up(); await p.waitForTimeout(150);
  ok(Math.abs((await p.evaluate(() => scrollY)) - y0) < 200, 'after a drag the page stays where it was');
  await p.evaluate(() => { st.billArrange = false; render(); window.scrollTo(0, 900); }); await p.waitForTimeout(100);
  const tk = p.locator('.list .item .tick').nth(8); await tk.scrollIntoViewIfNeeded(); const s0 = await p.evaluate(() => scrollY); await tk.click(); await p.waitForTimeout(150);
  ok(Math.abs((await p.evaluate(() => scrollY)) - s0) < 5, 'ticking paid lower down does not jump to the top');
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
