// Brute-force check of repeating events against an independent reference, in several time zones.
const { chromium } = require('playwright');
const URL = 'file:///mnt/project-files/family-app/index.html';
const TZS = (process.env.TZS || 'Asia/Kuala_Lumpur,America/New_York,Europe/London,Pacific/Auckland,Pacific/Kiritimati,America/Los_Angeles').split(',');
(async () => { const b = await chromium.launch(); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  for (const tz of TZS) {
    const ctx = await b.newContext({ timezoneId: tz }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.goto(URL); await p.evaluate(() => hideSplash());
    const r = await p.evaluate(() => {
      // reference: pure UTC arithmetic, no shortcuts
      const pad = n => String(n).padStart(2, '0');
      const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      function ref(e, from, to) { const out = []; const [y, m, d] = e.date.split('-').map(Number); const end = e.until && e.until < to ? e.until : to;
        for (let k = 0; k < 6000; k++) { let iso;
          if (!e.rep) { if (k) break; iso = e.date; }
          else if (e.rep === 'weekly') { const t = new Date(Date.UTC(y, m - 1, d) + k * 7 * 864e5); iso = `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; }
          else { const step = e.rep === 'yearly' ? 12 : 1, t = m - 1 + k * step, Y = y + Math.floor(t / 12), M = t % 12; iso = `${Y}-${pad(M + 1)}-${pad(Math.min(d, dim(Y, M)))}`; }
          if (iso > end) break; if (iso >= from && !(e.skip || []).includes(iso)) out.push(iso); }
        return out; }
      const isoU = t => `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
      let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
      const day0 = Date.UTC(2023, 0, 1), span = 365 * 10;
      const bad = []; let n = 0;
      // fixed tricky starts + random ones
      const starts = ['2024-02-29', '2028-02-29', '2025-01-29', '2025-01-30', '2025-01-31', '2024-01-31', '2026-03-31', '2026-05-31', '2026-08-31', '2026-12-31', '2026-12-29', '2027-02-28', '2026-02-28', '2026-11-30', '2026-10-31'];
      for (let i = 0; i < 300; i++) starts.push(isoU(new Date(day0 + rnd(span) * 864e5)));
      for (const s of starts) for (const rep of ['', 'weekly', 'monthly', 'yearly']) for (let j = 0; j < 6; j++) {
        const a = isoU(new Date(day0 + rnd(span) * 864e5)), z = isoU(new Date(Date.parse(a) + rnd(j < 3 ? 40 : 900) * 864e5));
        const e = {id: 'e', title: 'x', date: s, rep};
        if (rep && rnd(3) === 0) e.until = isoU(new Date(Date.parse(s) + rnd(1500) * 864e5));
        if (rep && rnd(3) === 0) { const all = ref(e, s, '2040-01-01'); if (all.length > 2) e.skip = [all[1], all[rnd(all.length)]]; }
        const got = evDates(a, z, [e]).map(x => x.date), want = ref(e, a, z); n++;
        if (JSON.stringify(got) !== JSON.stringify(want)) bad.push({e, a, z, got: got.slice(0, 4), want: want.slice(0, 4)});
      }
      // single-day lookups (what the calendar day view uses) for every day of Feb/Mar in leap + non-leap years
      const yearly = {id: 'y', date: '2024-02-29', rep: 'yearly'}, m31 = {id: 'm', date: '2024-01-31', rep: 'monthly'}, m29 = {id: 'n', date: '2025-01-29', rep: 'monthly'};
      for (const Y of [2025, 2026, 2027, 2028, 2032, 2100]) for (let dd = 0; dd < 60; dd++) { const iso = isoU(new Date(Date.UTC(Y, 1, 1) + dd * 864e5));
        for (const e of [yearly, m31, m29]) { n++; const got = evDates(iso, iso, [e]).length, want = ref(e, iso, iso).length; if (got !== want) bad.push({e, a: iso, got, want}); } }
      // evNext matches reference
      for (let i = 0; i < 300; i++) { const s = isoU(new Date(day0 + rnd(span) * 864e5)), rep = ['weekly', 'monthly', 'yearly'][i % 3], t = isoU(new Date(day0 + rnd(span) * 864e5));
        const e = {id: 'q', date: s, rep}; n++; const got = evNext(e, t), want = ref(e, t, '2099-12-31')[0] || ''; if (got !== want) bad.push({e, a: t, got, want}); }
      return {n, bad: bad.slice(0, 5), nbad: bad.length};
    });
    ok(r.nbad === 0, `${tz}: ${r.n} checks, ${r.nbad} wrong ${r.nbad ? JSON.stringify(r.bad) : ''}`);
    // the year 2100 is NOT a leap year; 2000-style rule check
    const c = await p.evaluate(() => [evDates('2100-02-01', '2100-03-01', [{id: 'y', date: '2096-02-29', rep: 'yearly'}]).map(x => x.date), evDates('2000-02-01', '2000-03-01', [{id: 'y', date: '1996-02-29', rep: 'yearly'}]).map(x => x.date)]);
    ok(c[0][0] === '2100-02-28' && c[1][0] === '2000-02-29', `${tz}: 2100 not leap (${c[0]}), 2000 leap (${c[1]})`);
    ok(!errs.length, `${tz}: no page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  { const ctx = await b.newContext({ timezoneId: 'Asia/Kuala_Lumpur' }); const p = await ctx.newPage(); await p.goto(URL); await p.evaluate(() => hideSplash());
    const dots = (y, m) => p.evaluate(([y, m]) => { go('calendar'); st.calY = y; st.calM = m; st.calSel = null; render(); return [...document.querySelectorAll('.cal .d')].filter(x => x.querySelector('.dots')).map(x => parseInt(x.textContent)); }, [y, m]);
    await p.evaluate(() => { D().events = [{id: 'y', title: 'Birthday', date: '2024-02-29', rep: 'yearly'}]; D().tasks = []; D().bills = []; D().kids = []; });
    let d = await dots(2027, 1); ok(JSON.stringify(d) === '[28]', 'calendar Feb 2027: 29 Feb birthday shows on the 28th: ' + d);
    d = await dots(2028, 1); ok(JSON.stringify(d) === '[29]', 'calendar Feb 2028: on the 29th: ' + d);
    d = await dots(2027, 2); ok(d.length === 0, 'not repeated again on 1 Mar: ' + d);
    await p.evaluate(() => { D().events = [{id: 'm', title: 'Rent', date: '2026-01-31', rep: 'monthly'}]; });
    for (const [y, m, want] of [[2026, 1, 28], [2028, 1, 29], [2026, 3, 30], [2026, 11, 31]]) { d = await dots(y, m); ok(JSON.stringify(d) === `[${want}]`, `monthly 31st in ${y}-${m + 1}: ${d}`); }
    await p.evaluate(() => { D().events = [{id: 'w', title: 'Futsal', date: '2026-12-29', rep: 'weekly'}]; });
    d = await dots(2027, 0); ok(JSON.stringify(d) === '[5,12,19,26]', 'weekly crosses the new year: ' + d);
    // edit: change start date clears old skipped dates; change only title keeps them
    await p.evaluate(() => { D().events = [{id: 'k', title: 'Class', date: '2026-11-02', rep: 'weekly', skip: ['2026-11-09']}]; eventSheet(null, 'k'); });
    await p.fill('#et', 'Class 2'); await p.evaluate(() => saveEvent('k')); ok(await p.evaluate(() => D().events[0].skip.length === 1), 'renaming keeps the skipped date');
    await p.evaluate(() => eventSheet(null, 'k')); await p.fill('#ed', '2026-11-03'); await p.evaluate(() => saveEvent('k')); ok(await p.evaluate(() => D().events[0].skip.length === 0), 'moving the start date clears old skips');
    await p.evaluate(() => eventSheet(null, 'k')); await p.selectOption('#erp', ''); await p.evaluate(() => saveEvent('k'));
    ok(await p.evaluate(() => !D().events[0].rep && evDates('2026-11-01', '2026-12-31').length === 1), 'turning repeat off leaves one date');
    // an event set years ahead still shows in Upcoming
    await p.evaluate(() => { D().events = [{id: 'f', title: 'Far', date: '2031-06-01', rep: 'yearly'}]; go('calendar'); render(); });
    ok(await p.evaluate(() => document.getElementById('app').innerText.includes('Far')), 'repeat starting in 2031 shows in Upcoming');
    await ctx.close(); }
  console.log(f ? 'FAILED' : 'ALL OK'); await b.close(); })();
