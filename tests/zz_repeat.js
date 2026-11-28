const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  const E = (o) => p.evaluate(o => { D().events = o; render(); }, o);
  const days = (a, z) => p.evaluate(([a, z]) => evDates(a, z).map(e => e.date), [a, z]);
  // weekly
  await E([{id: 'w', title: 'Futsal', date: '2026-11-03', rep: 'weekly'}]);
  let d = await days('2026-11-01', '2026-11-30'); ok(JSON.stringify(d) === '["2026-11-03","2026-11-10","2026-11-17","2026-11-24"]', 'weekly in Nov: ' + d);
  d = await days('2030-01-01', '2030-01-31'); ok(d.length >= 4 && d.every(x => new Date(x + 'T00:00').getDay() === 2), 'weekly years later still on Tuesday: ' + d);
  d = await days('2026-10-01', '2026-10-31'); ok(d.length === 0, 'nothing before the start date');
  // monthly on the 31st
  await E([{id: 'm', title: 'Rent', date: '2026-01-31', rep: 'monthly'}]);
  d = await days('2026-01-01', '2026-12-31'); ok(d.length === 12 && d[1] === '2026-02-28' && d[3] === '2026-04-30' && d[4] === '2026-05-31', 'monthly 31st: Feb 28, Apr 30, May 31: ' + d.slice(0, 5));
  d = await days('2028-02-01', '2028-02-29'); ok(d[0] === '2028-02-29', 'leap Feb gets the 29th: ' + d);
  // yearly 29 Feb
  await E([{id: 'y', title: 'Birthday', date: '2024-02-29', rep: 'yearly'}]);
  d = await days('2024-01-01', '2029-12-31'); ok(JSON.stringify(d) === '["2024-02-29","2025-02-28","2026-02-28","2027-02-28","2028-02-29","2029-02-28"]', 'yearly 29 Feb: ' + d);
  // until + skip
  await E([{id: 'u', title: 'Class', date: '2026-11-02', rep: 'weekly', until: '2026-11-23', skip: ['2026-11-16']}]);
  d = await days('2026-11-01', '2026-12-31'); ok(JSON.stringify(d) === '["2026-11-02","2026-11-09","2026-11-23"]', 'until + skipped date respected: ' + d);
  // one-off still works, broken dates ignored
  await E([{id: 'o', title: 'Once', date: '2026-11-05'}, {id: 'bad', title: 'Bad', date: 'x', rep: 'weekly'}, {id: 'bad2', title: 'Bad2', rep: 'monthly'}]);
  d = await days('2026-11-01', '2026-11-30'); ok(JSON.stringify(d) === '["2026-11-05"]', 'one-off unchanged, bad dates skipped');
  // UI: create through the sheet
  await p.evaluate(() => { D().events = []; go('calendar'); st.calY = 2026; st.calM = 10; st.calSel = '2026-11-28'; render(); eventSheet('2026-11-28'); });
  await p.fill('#et', NASTY[0]); await p.selectOption('#erp', 'monthly');
  ok(await p.isVisible('#eu'), 'Until shows once a repeat is picked');
  await p.fill('#eu', '2026-01-01'); await p.evaluate(() => saveEvent('')); ok(await p.evaluate(() => D().events.length === 0), 'Until before start is refused');
  await p.fill('#eu', ''); await p.evaluate(() => saveEvent('')); await p.waitForTimeout(200);
  ok(await p.evaluate(() => D().events.length === 1 && D().events[0].rep === 'monthly'), 'saved as monthly');
  await p.evaluate(() => { st.calM = 11; st.calSel = '2026-12-28'; render(); });
  let t = await p.evaluate(() => document.getElementById('app').innerText); ok(t.includes(`Adam's "toy"`) && /every month/i.test(t), 'shows on 28 Dec as a monthly event');
  ok(await p.evaluate(() => document.querySelectorAll('.cal .d .dots').length >= 1), 'dot on the calendar');
  // upcoming: weekly shows once
  await p.evaluate(() => { D().events = [{id: 'w', title: 'Futsal', date: '2026-01-06', rep: 'weekly'}]; render(); });
  t = await p.evaluate(() => [...document.querySelectorAll('.list .item .t')].filter(x => x.textContent === 'Futsal').length);
  ok(t >= 1 && t <= 2, 'weekly event listed once in Upcoming (plus day view): ' + t);
  // open an occurrence and skip it
  await p.evaluate(() => { const n = evNext(D().events[0], todayISO()); window._n = n; eventSheet(null, 'w', n); });
  ok(await p.isVisible('text=only'), 'Skip-this-date button on a repeat');
  await p.click('button:has-text("only")'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => D().events[0].skip.includes(window._n) && evNext(D().events[0], todayISO()) !== window._n), 'skipped date gone, next one moves on');
  // home + coming up
  ok(await p.evaluate(() => upcomingItems(14).filter(x => x.title === 'Futsal').length >= 1), 'shows in Coming up on Home');
  // export has RRULE
  const ics = await p.evaluate(async () => { let txt = ''; const o = URL.createObjectURL; URL.createObjectURL = bl => { bl.text().then(x => txt = x); return 'data:,'; }; icsExport('w'); await new Promise(r => setTimeout(r, 100)); URL.createObjectURL = o; return txt; });
  ok(/RRULE:FREQ=WEEKLY/.test(ics) && /EXDATE/.test(ics), 'phone calendar file repeats weekly, with skipped date');
  // speed: 200 weekly events from 2020, render the calendar
  const ms = await p.evaluate(() => { D().events = Array.from({length: 200}, (_, i) => ({id: 'p' + i, title: 'E' + i, date: '2020-01-0' + (1 + i % 9), rep: ['weekly', 'monthly', 'yearly'][i % 3]})); const t0 = performance.now(); render(); return performance.now() - t0; });
  ok(ms < 800, `200 repeating events since 2020 render in ${ms.toFixed(0)} ms`);
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
