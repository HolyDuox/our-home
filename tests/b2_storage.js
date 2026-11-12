const { chromium } = require('playwright'); const { open } = require('./common');
(async () => {
  const b = await chromium.launch(); const { p, errs } = await open(b);
  // old-version user: data only in localStorage -> should migrate into IndexedDB
  await p.evaluate(() => { localStorage.setItem('ourhome.v1', JSON.stringify({settings: {nameA: 'Legacy'}, tasks: [{id: 'x', title: 'old task', done: false}]})); });
  await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(300);
  console.log('legacy loaded:', await p.evaluate(() => [S().nameA, D().tasks.length, !!localStorage.getItem('ourhome.v1')]), 'in IDB:', await p.evaluate(async () => !!(await IMG.get('__data__'))));
  // grow to ~12M chars (way past localStorage)
  await p.evaluate(() => { for (let i = 0; i < 90000; i++) D().expenses.push({id: uid(), amount: 12.5, date: '2026-01-01', cat: 'Food', who: 'A', note: 'Lunch at somewhere nice'}); DB.save(); });
  await p.waitForTimeout(1500);
  const size = await p.evaluate(() => JSON.stringify(D()).length);
  await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(1500);
  console.log('chars', size, 'after reload expenses:', await p.evaluate(() => D().expenses.length), 'name', await p.evaluate(() => S().nameA), 'ls copy kept:', await p.evaluate(() => !!localStorage.getItem('ourhome.v1')));
  // edit after reload persists
  await p.evaluate(() => { D().tasks.push({id: uid(), title: 'new after big', done: false}); DB.save(); }); await p.waitForTimeout(800);
  await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(1500);
  console.log('tasks after 2nd reload', await p.evaluate(() => D().tasks.map(t => t.title)));
  console.log('errors:', [...new Set(errs)]); await b.close();
})();
