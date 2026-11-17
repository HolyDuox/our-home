// Stress test for Wealth (gold + investments), commitment reordering and the Fulfillment category
const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
const res = []; const ok = (c, m) => { res.push([!!c, m]); console.log(c ? 'ok  ' : 'FAIL', m); };
const bad = t => /NaN|Infinity|undefined|\[object/.test(t);
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  const txt = () => p.evaluate(() => document.getElementById('app').innerText);
  const wealth = async () => { await p.evaluate(() => { closeSheet(); go('money', 'Wealth'); }); await p.waitForTimeout(80); return txt(); };
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; });

  // ---- GOLD: no price yet ----
  await p.evaluate(() => goldSheet()); await p.fill('#gg', '5'); await p.evaluate(() => saveGold(''));
  let t = await wealth(); ok(!bad(t), 'gold with no price set shows no NaN');
  // price validation
  for (const v of ['0', '-5', 'abc', '']) { await p.evaluate(() => goldPriceSheet()); await p.fill('#gp', v); await p.evaluate(() => saveGoldPrice()); }
  ok(!(await p.evaluate(() => S().goldPrice)), 'rejects price 0 / negative / text / empty');
  await p.evaluate(() => goldPriceSheet()); await p.fill('#gp', '545.5'); await p.evaluate(() => saveGoldPrice());
  // weight validation
  const before = await p.evaluate(() => D().gold.length);
  for (const v of ['0', '-3', 'abc', '']) { await p.evaluate(() => goldSheet()); await p.fill('#gg', v); await p.evaluate(() => saveGold('')); }
  ok(await p.evaluate(() => D().gold.length) === before, 'rejects weight 0 / negative / text / empty');
  // comma decimal (some Android keyboards type 5,5)
  await p.evaluate(() => goldSheet()); await p.fill('#gg', '5,5'); await p.evaluate(() => saveGold(''));
  ok(await p.evaluate(() => D().gold.at(-1).grams) === 5.5, 'comma decimal 5,5 g read as 5.5 g (got ' + await p.evaluate(() => D().gold.at(-1).grams) + ')');
  // tiny + huge + bracket format
  await p.evaluate(() => { D().gold = [{id: 'g1', name: 'Tiny', grams: 0.001, purity: '999'}, {id: 'g2', name: 'Huge', grams: 1e6, purity: '999', cost: 1}, {id: 'g3', name: 'Odd purity', grams: 10, purity: '585'}, {id: 'g4', name: 'Bar', grams: 76.38, purity: '999'}]; DB.save(); });
  t = await wealth(); ok(!bad(t), 'tiny, 1,000,000 g and unknown purity render cleanly');
  ok(t.includes('76.38 g (76.304)'), '999 shows full weight with 0.999 in brackets');
  ok(t.includes('0.001 g (0.001)'), 'very small weight still readable');
  // nasty names
  await p.evaluate(N => { D().gold = N.map((n, i) => ({id: 'n' + i, name: n, grams: i + 1, purity: ['999', '916', '835', '750'][i % 4], cost: i * 100, date: '2024-02-29', who: ['A', 'B', 'both'][i % 3], note: n}));
    D().investments = N.map((n, i) => ({id: 'i' + i, name: n, type: 'ASB', rate: 5, start: 1000, startDate: '2020-01-31', monthly: 100, who: 'both', note: n})); DB.save(); }, NASTY);
  t = await wealth(); ok(!bad(t) && !errs.length, 'weird names (quotes, HTML, emoji, 300 chars) render safely');
  for (let i = 0; i < NASTY.length; i++) { await p.evaluate(i => goldSheet('n' + i), i); await p.evaluate(i => saveGold('n' + i), i); await p.evaluate(i => invSheet('i' + i), i); await p.evaluate(i => saveInv('i' + i), i); }
  ok(!errs.length && await p.evaluate(() => D().gold.length) === NASTY.length, 'open + save every weird item without errors');
  ok(!(await p.evaluate(() => document.querySelector('#app script'))), 'no HTML injected from names');

  const tn = await p.evaluate(() => ['5,5', '1,000', '12,500.50', '1.000', 'RM 1,850', '  42 ', '-3,25', '1,234,567'].map(toNum));
  ok(tn.join() === '5.5,1000,12500.5,1,1850,42,-3.25,1234567', 'number reading (comma decimals, thousands, RM): ' + tn);
  // ---- INVESTMENTS maths ----
  const fv = await p.evaluate(() => [invFV(0, 100, 0, 12), invFV(1000, 0, 12, 12), invFV(10000, 200, 5, 12), invFV(0, 0, 5, 0)]);
  ok(fv[0] === 1200, '0% = plain sum (1200)'); ok(Math.abs(fv[1] - 1126.83) < 0.01, '12% monthly compounding on 1000 for 1y = 1126.83 (' + fv[1].toFixed(2) + ')');
  ok(Math.abs(fv[2] - 12967.39) < 0.01, 'ASB example 10k + 200/m at 5% = 12967.39'); ok(fv[3] === 0, 'empty = 0');
  const mb = await p.evaluate(() => [fullMonths('2026-01-31', '2026-02-28'), fullMonths('2026-01-31', '2026-03-31'), fullMonths('2027-01-01', '2026-11-18'), fullMonths('1970-01-01', '2026-11-18')]);
  ok(mb[0] === 0 && mb[1] === 2 && mb[2] === 0 && mb[3] === 682, 'month counting: 31st, future start, 1970 start ' + mb);
  for (const r of ['-1', '101', 'abc', '']) { await p.evaluate(() => invSheet()); await p.fill('#in', 'Bad ' + r); await p.fill('#ir', r); await p.evaluate(() => saveInv('')); }
  ok(!(await p.evaluate(() => D().investments.some(i => /^Bad/.test(i.name)))), 'rejects % below 0, above 100, text, empty');
  await p.evaluate(() => invSheet()); await p.fill('#in', 'Comma'); await p.fill('#ir', '5,5'); await p.fill('#im', '1.000'); await p.evaluate(() => saveInv(''));
  ok(await p.evaluate(() => D().investments.at(-1).rate) === 5.5, 'rate typed 5,5 read as 5.5 (got ' + await p.evaluate(() => D().investments.at(-1).rate) + ')');
  // extreme: 100%/yr since 1970 + future start
  await p.evaluate(() => { D().investments.push({id: 'x1', name: 'Crazy', type: 'Other', rate: 100, start: 1e6, startDate: '1970-01-01', monthly: 1e5, who: 'both'}, {id: 'x2', name: 'Future', type: 'FD', rate: 4, start: 5000, startDate: '2030-01-01', monthly: 0, who: 'A'}); DB.save(); });
  t = await wealth(); ok(!bad(t), 'extreme investment (100%/yr since 1970) shows no NaN/Infinity');
  ok(await p.evaluate(() => invNow(D().investments.find(i => i.id === 'x2'))) === 5000, 'future start date = no growth yet');
  await p.evaluate(() => { D().investments = D().investments.filter(i => i.id !== 'x1'); DB.save(); });

  // ---- Investment <-> Commitment link ----
  await p.evaluate(() => { D().bills = []; invSheet(); }); await p.fill('#in', 'TH'); await p.fill('#ir', '3'); await p.fill('#im', '300'); await p.check('#ib'); await p.fill('#iday', '40'); await p.evaluate(() => saveInv(''));
  let id = await p.evaluate(() => D().investments.at(-1).id);
  ok(await p.evaluate(id => D().bills.find(b => b.id === 'inv-' + id)?.dueDay, id) === 31, 'pay day 40 clamped to 31');
  await p.evaluate(id => invSheet(id), id); await p.fill('#im', '450'); await p.evaluate(id => saveInv(id), id);
  ok(await p.evaluate(id => D().bills.filter(b => b.id === 'inv-' + id).length === 1 && D().bills.find(b => b.id === 'inv-' + id).amount === 450, id), 'editing amount updates the one commitment (no duplicate)');
  await p.evaluate(id => invSheet(id), id); await p.fill('#im', '0'); await p.evaluate(id => saveInv(id), id);
  ok(!(await p.evaluate(id => D().bills.some(b => b.id === 'inv-' + id), id)), 'monthly 0 removes the commitment');
  await p.evaluate(id => invSheet(id), id); await p.fill('#im', '300'); await p.check('#ib'); await p.evaluate(id => saveInv(id), id);
  await p.evaluate(id => { D().bills = D().bills.filter(b => b.id !== 'inv-' + id); DB.save(); }, id); t = await wealth();
  ok(!bad(t) && !errs.length, 'deleting the commitment on its own leaves the investment fine');

  // ---- 300 gold + 300 investments: speed ----
  await p.evaluate(() => { const t = todayISO(); D().gold = Array.from({length: 300}, (_, i) => ({id: 'G' + i, name: 'Gold ' + i, grams: (i % 50) + 0.5, purity: ['999', '916'][i % 2], cost: 500 + i, date: t, who: 'both'}));
    D().investments = Array.from({length: 300}, (_, i) => ({id: 'I' + i, name: 'Inv ' + i, type: 'ASB', rate: i % 12, start: i * 100, startDate: '2015-06-30', monthly: i, who: 'both'})); DB.save(); });
  let ms = await p.evaluate(() => { const s = performance.now(); for (let i = 0; i < 10; i++) render(); return (performance.now() - s) / 10; });
  await p.evaluate(() => go('money', 'Wealth')); ms = Math.max(ms, await p.evaluate(() => { const s = performance.now(); render(); return performance.now() - s; }));
  ok(ms < 150, `Wealth page with 300 gold + 300 investments renders in ${ms.toFixed(0)} ms`);
  await p.evaluate(() => go('money', 'Overview')); t = await txt(); ok(!bad(t) && /Wealth/.test(t), 'Finance Overview wealth card fine with 600 items');

  // ---- REORDER: 80 commitments ----
  await p.evaluate(() => { D().bills = Array.from({length: 80}, (_, i) => ({id: 'b' + i, name: 'Bill ' + i, amount: 10 + i, dueDay: (i * 7) % 31 + 1, type: 'Utilities', payer: 'both', paid: []}));
    D().bills.push({id: 'old', name: 'Ended loan', amount: 99, dueDay: 3, type: 'Loan', payer: 'both', paid: [], startDate: '2020-01-01', endDate: '2021-01-01'}); DB.save(); go('money', 'Bills'); st.commitView = 'monthly'; st.billArrange = true; render(); });
  const order = () => p.evaluate(() => [...D().bills].filter(b => activeBill(b)).sort(billSort).map(b => b.id));
  const o0 = await order(); ok(o0.length === 80, 'ended commitment stays out of the arrange list');
  ok(await p.evaluate(() => { billMove(D().bills.filter(b => activeBill(b)).sort(billSort)[0].id, -1); return true; }), 'moving the top one up does nothing harmful');
  await p.evaluate(() => { const ids = [...D().bills].filter(b => activeBill(b)).sort(billSort).map(b => b.id); billMove(ids.at(-1), 1); });
  ok((await order()).join() === o0.join(), 'moving the bottom one down does nothing');
  // 200 random arrow moves, then check it's still a clean list
  await p.evaluate(() => { for (let k = 0; k < 200; k++) { const ids = [...D().bills].filter(b => activeBill(b)).sort(billSort).map(b => b.id); billMove(ids[Math.floor(Math.random() * ids.length)], Math.random() < .5 ? -1 : 1); } });
  let o1 = await order(); ok(new Set(o1).size === 80 && o1.length === 80, '200 random moves: no item lost or duplicated');
  ok(await p.evaluate(() => { const os = D().bills.map(b => b.order); return new Set(os).size === os.length; }), 'order numbers stay unique');
  // real drags with the mouse, incl. auto-scroll down a long list
  await p.evaluate(() => document.getElementById('billArr').scrollIntoView()); await p.waitForTimeout(150);
  for (let k = 0; k < 6; k++) {
    const rows = p.locator('#billArr .item'); const g = rows.nth(1).locator('.grip'); const gb = await g.boundingBox();
    const first = await rows.nth(1).getAttribute('data-id');
    await p.mouse.move(gb.x + 5, gb.y + 5); await p.mouse.down(); for (let y = gb.y; y < 800; y += 20) await p.mouse.move(gb.x + 5, y); await p.waitForTimeout(400); await p.mouse.move(gb.x + 5, 760); await p.mouse.up(); await p.waitForTimeout(150);
    const o = await order(); if (k === 0) ok(o.indexOf(first) > 3, 'drag down with auto-scroll moves the item further down (now #' + (o.indexOf(first) + 1) + ')');
    await p.evaluate(() => document.getElementById('billArr').scrollIntoView());
  }
  o1 = await order(); ok(new Set(o1).size === 80, 'after 6 long drags: nothing lost');
  // tap a grip without moving = no change, no save storm
  const o2 = await order(); const g0 = await p.locator('#billArr .item').nth(2).locator('.grip').boundingBox(); await p.mouse.click(g0.x + 5, g0.y + 5); ok((await order()).join() === o2.join(), 'tapping the handle without dragging changes nothing');
  // paying / editing still works with custom order, list order follows
  await p.evaluate(() => { st.billArrange = false; render(); }); const firstShown = await p.evaluate(() => document.querySelector('.list .item .t').textContent);
  const firstOrder = await p.evaluate(() => [...D().bills].filter(b => activeBill(b)).sort(billSort)[0].name); ok(firstShown.includes(firstOrder), 'monthly list shows your order');
  await p.evaluate(() => payBill([...D().bills].filter(b => activeBill(b)).sort(billSort)[0].id)); ok(!errs.length, 'ticking paid works with custom order');
  // a synced-in bill from the other phone without order goes to the end
  await p.evaluate(() => { D().bills.push({id: 'remote', name: 'From wife', amount: 5, dueDay: 1, type: 'Other', payer: 'B', paid: []}); render(); }); ok((await order()).at(-1) === 'remote', 'new commitment from the other phone lands at the end');
  // two phones reordering at once -> duplicate order numbers: must not crash, list complete
  await p.evaluate(() => { D().bills.slice(0, 20).forEach(b => b.order = 3); render(); }); ok(new Set(await order()).size === 81 && !errs.length, 'clashing order numbers (both phones reorder at once) still show every item');
  await p.evaluate(() => billResetOrder()); const o3 = await p.evaluate(() => [...D().bills].filter(b => activeBill(b)).sort(billSort).map(b => b.dueDay)); ok(o3.every((d, i) => !i || o3[i - 1] <= d), 'Sort by due date restores date order');
  // order survives reload
  await p.evaluate(() => { const ids = [...D().bills].filter(b => activeBill(b)).sort(billSort).map(b => b.id); billMove(ids[5], -1); });
  const keep = await order(); await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(800); ok((await order()).join() === keep.join(), 'custom order survives closing and reopening the app');
  // order is part of what syncs
  ok(await p.evaluate(() => { const m = syncCollect(); const r = [...m.values()].find(x => x.coll === 'bills' && x.data.order != null); return !!r; }), 'order is included in the synced data');

  // ---- Fulfillment ----
  await p.evaluate(() => { const t = todayISO(); for (let i = 0; i < 500; i++) D().expenses.push({id: 'e' + i, amount: 1 + i % 40, date: t, cat: i % 3 ? 'Fulfillment' : 'Food', who: i % 2 ? 'A' : 'B', note: 'x'}); D().expenses.push({id: 'eu', amount: 7, date: t, cat: 'Gaming', who: 'A', note: 'old unknown cat'}); DB.save(); go('money', 'Expenses'); });
  t = await txt(); ok(/Fulfillment/.test(t) && !bad(t), 'Fulfillment in the chart with 500 expenses, unknown old category ok');
  await p.evaluate(() => expSheet('e1')); ok(await p.evaluate(() => document.getElementById('xc').value) === 'Fulfillment', 'editing an Fulfillment expense keeps its category');

  // ---- small screen + dark mode ----
  for (const [w, sch] of [[320, 'light'], [390, 'dark']]) { const o = await open(b, {w, scheme: sch});
    await o.p.evaluate(() => { S().goldPrice = 545; D().gold = [{id: 'a', name: 'Bar '.repeat(30), grams: 76.38, purity: '999', cost: 30000, who: 'B'}]; D().investments = [{id: 'i', name: 'ASB '.repeat(20), type: 'ASB', rate: 5, start: 123456789, startDate: '2020-01-01', monthly: 99999, who: 'both'}]; go('money', 'Wealth'); });
    const over = await o.p.evaluate(() => document.documentElement.scrollWidth > innerWidth); ok(!over, `no sideways scrolling at ${w}px ${sch}`); await o.p.screenshot({ path: `../rs_${w}.png` }); await o.ctx.close(); }

  ok(!errs.length, 'no page errors overall ' + errs.join(' | '));
  console.log(`\n${res.filter(r => r[0]).length}/${res.length} passed`); await b.close(); })();
