const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok' : 'FAIL', m); if (!c) f++; };
  const n = await p.evaluate(() => Object.keys(HOLS).length); ok(n === 48, 'holiday count ' + n);
  ok(await p.evaluate(() => Object.keys(HOLS).every(d => !isNaN(new Date(d + 'T00:00')) && isoOf(new Date(d + 'T00:00')) === d)), 'all dates valid');
  // every "(replacement)" should be on a weekday right after a Sunday holiday chain
  ok(await p.evaluate(() => Object.keys(HOLS).filter(d => /replacement/.test(HOLS[d])).every(d => { const w = new Date(d + 'T00:00').getDay(); return w >= 1 && w <= 5; })), 'replacement days fall on weekdays');
  await p.evaluate(() => { go('calendar'); st.planView = 'cal'; st.calY = 2026; st.calM = 11; st.calSel = '2026-12-11'; render(); }); await p.waitForTimeout(200);
  let t = await p.evaluate(() => document.getElementById('app').innerText); ok(/Sultan of Selangor's Birthday/.test(t) && /Christmas/.test(t), 'December shows holidays + selected day lists it');
  ok(await p.evaluate(() => document.querySelectorAll('.cal .d.hol').length) === 2, 'two red days in Dec 2026');
  await p.screenshot({ path: '../hol_dec.png' });
  await p.evaluate(() => { st.calY = 2027; st.calM = 1; st.calSel = null; render(); }); await p.screenshot({ path: '../hol_feb.png' });
  ok(await p.evaluate(() => document.querySelectorAll('.cal .d.hol').length) === 4, 'Feb 2027: CNY 6,7, replacement 8, Nuzul 24');
  await p.evaluate(() => { st.calY = 2028; st.calM = 0; render(); }); t = await p.evaluate(() => document.getElementById('app').innerText); ok(/not added yet/.test(t), '2028 says not added yet');
  await p.evaluate(() => { st.calY = 2027; st.calM = 3; render(); }); t = await p.evaluate(() => document.getElementById('app').innerText); ok(/No public holidays this month/.test(t), 'April 2027 none');
  await p.evaluate(() => { st.calY = 2026; st.calM = 11; render(); }); await p.click('.holrow .tlink'); ok(await p.evaluate(() => document.querySelectorAll('.cal .d.hol').length) === 0, 'Hide removes them');
  await p.click('.holrow .tlink'); ok(await p.evaluate(() => document.querySelectorAll('.cal .d.hol').length) === 2, 'Show brings them back');
  ok(await p.evaluate(() => { const r = upcomingItems(40); return r.some(x => /Sultan/.test(x.title)) && r.some(x => /Christmas/.test(x.title)); }), 'Home "Coming up" includes holidays (from 19 Nov)');
  await p.evaluate(() => go('home')); t = await p.evaluate(() => document.getElementById('app').innerText); ok(!/NaN|undefined/.test(t), 'Home renders fine');
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
