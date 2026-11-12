const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p } = await open(b);
  console.log(await p.evaluate(() => { const R = n => Math.floor(Math.random() * n); const k = newKid({name: 'A'}); k.babylog = Array.from({length: 16000}, (_, i) => ({id: 'b' + i, at: Date.now(), type: 'feed', sub: 'Bottle 120 ml'})); D().kids.push(k);
    D().expenses = Array.from({length: 9000}, (_, i) => ({id: 'e' + i, amount: 10, date: '2026-01-01', cat: 'Food', who: 'A', note: 'Lunch'})); D().tasks = Array.from({length: 3000}, (_, i) => ({id: 't' + i, title: 'Task ' + i, done: false}));
    const t0 = performance.now(); const m = syncCollect(); let n = 0; for (const [, v] of m) { hashOf(v.data); n++; } return {rows: n, ms: Math.round(performance.now() - t0)}; }));
  await b.close(); })();
