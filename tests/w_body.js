const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  const txt = () => p.evaluate(() => document.getElementById('app').innerText); const bad = t => /NaN|undefined|Infinity|\[object|null/.test(t);
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; S().me = 'A'; go('more', 'Exercise'); st.xTab = 'body'; render(); });
  let t = await txt(); ok(/Weight now/.test(t) && !bad(t), 'empty Body page renders');
  await p.evaluate(() => bodySheet()); await p.evaluate(() => saveBody('', 'A')); ok(await p.evaluate(() => (D().body || []).length) === 0, 'empty entry rejected'); await p.evaluate(() => closeSheet());
  const d = i => p.evaluate(i => addDaysISO(todayISO(), -7 * i), i);
  for (const [i, w, waist] of [[8, '82,4', 92], [4, '80.1', 90], [0, '78.6', '']]) { await p.evaluate(() => bodySheet()); await p.fill('#bd', await d(i)); await p.fill('#b_weight', w); if (waist) await p.fill('#b_waist', String(waist)); await p.evaluate(() => saveBody('', 'A')); }
  await p.evaluate(() => bodyGoalSheet()); await p.fill('#g_height', '172'); await p.fill('#g_weight', '72'); await p.fill('#g_waist', '84'); await p.evaluate(() => saveBodyGoal('A'));
  t = await txt(); ok(/78\.6 kg/.test(t) && /72 kg/.test(t) && /6\.6 kg to lose/.test(t), 'current 78.6 vs goal 72: 6.6 kg to lose');
  ok(/BMI[\s\S]{0,120}26\.6[\s\S]{0,20}Overweight/.test(t), 'BMI from height 172 = 26.6');
  ok(/90 cm/.test(t) && /84 cm/.test(t), 'waist keeps the latest value (90) even if the newest entry skipped it');
  ok(/37% of the way from 82\.4/.test(t), 'progress from first weigh-in: ' + (t.match(/\d+% of the way[^\n]*/) || [''])[0]);
  ok(await p.evaluate(() => !!document.querySelector('#app svg polyline')), 'weight chart drawn');
  // gain goal
  await p.evaluate(() => { D().bodygoals.B = {weight: 55, arm: 30}; D().body.push({id: 'b1', who: 'B', date: todayISO(), weight: 52, arm: 27}); st.bWho = 'B'; render(); });
  t = await txt(); ok(/3 kg to gain/.test(t) && /3 cm to gain/.test(t), 'gain goal for Wife works'); ok(!/78\.6/.test(t), "Wife's page doesn't show Shaz's data");
  await p.evaluate(() => { D().body.push({id: 'b2', who: 'B', date: todayISO(), at: Date.now() + 5, weight: 55}); render(); }); ok(/Reached 🎉/.test(await txt()), 'reached goal shows 🎉');
  // junk + extremes
  await p.evaluate(N => { N.forEach((n, i) => D().body.push({id: 'j' + i, who: 'B', date: i % 2 ? '2024-02-29' : 'bad-date', weight: n, waist: -5, note: n})); D().bodygoals.B = {weight: 'abc', height: 0}; render(); }, NASTY);
  t = await txt(); ok(!bad(t) && !(await p.evaluate(() => document.querySelector('#app script'))), 'junk values / bad dates render safely');
  await p.evaluate(() => bodySheet()); await p.fill('#b_weight', '5000'); await p.evaluate(() => saveBody('', 'B')); ok(!(await p.evaluate(() => D().body.some(x => x.weight === 5000))), '5000 kg rejected');
  await p.evaluate(() => closeSheet());
  // single entry -> no chart
  await p.evaluate(() => { D().body = [{id: 's', who: 'A', date: todayISO(), weight: 70}]; st.bWho = 'A'; render(); }); ok(!(await p.evaluate(() => document.querySelector('#app svg polyline'))), 'one entry: no chart, no error');
  // 5 years weekly
  await p.evaluate(() => { for (let k = 0; k < 520; k++) D().body.push({id: 'k' + k, who: k % 2 ? 'A' : 'B', date: addDaysISO(todayISO(), -7 * Math.floor(k / 2)), weight: 70 + Math.sin(k / 9) * 4, waist: 85}); });
  const ms = await p.evaluate(() => { const s = performance.now(); render(); return performance.now() - s; }); ok(ms < 150, `5 years of weekly entries renders in ${ms.toFixed(0)} ms`);
  // edit + delete
  await p.evaluate(() => bodySheet('s')); await p.fill('#b_weight', '69.5'); await p.evaluate(() => saveBody('s', 'A')); ok(await p.evaluate(() => D().body.find(x => x.id === 's').weight) === 69.5, 'edit entry');
  await p.evaluate(() => bodySheet('s')); await p.click('.sheet button.red'); await p.click('.sheet button.red'); ok(!(await p.evaluate(() => D().body.some(x => x.id === 's'))), 'delete entry');
  ok(await p.evaluate(() => { const m = syncCollect(); const c = [...m.values()]; return c.some(x => x.coll === 'body') && c.some(x => x.coll === 'bodygoals' && x.id === 'A'); }), 'entries and each person\'s goals sync');
  await p.evaluate(() => { D().body = D().body.filter(x => !/^k/.test(x.id)); const t = todayISO(); [[84, 94], [82.3, 92], [81, 91], [79.8, 90], [78.6, 89]].forEach(([w, ws], i) => D().body.push({id: 'demo' + i, who: 'A', date: addDaysISO(t, -14 * (4 - i)), weight: w, waist: ws, chest: 101, arm: 33})); D().bodygoals.A = {weight: 72, waist: 84, chest: 100, arm: 35, height: 172, date: '2027-06-30'}; render(); window.scrollTo(0, 0); });
  await p.screenshot({ path: '../body1.png' }); await p.evaluate(() => window.scrollTo(0, 650)); await p.screenshot({ path: '../body2.png' });
  const o = await open(b, {w: 320}); await o.p.evaluate(() => { D().body = [{id: 'x', who: 'A', date: todayISO(), weight: 123.4, waist: 123.4, chest: 123.4}]; D().bodygoals = {A: {weight: 100.5, waist: 100.5}}; S().me = 'A'; go('more', 'Exercise'); st.xTab = 'body'; render(); });
  ok(!(await o.p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no sideways scroll at 320px'); await o.ctx.close();
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
