const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  await p.evaluate(() => { D().expenses.push({id: 'x1', amount: 30, date: todayISO(), cat: 'Entertainment', who: 'A', note: 'Cinema'}); DB.save(); });
  await p.waitForTimeout(500); await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(800);
  const c = await p.evaluate(() => D().expenses.find(e => e.id === 'x1').cat);
  await p.evaluate(() => syncApply('expenses', 'x2', {id: 'x2', amount: 5, date: todayISO(), cat: 'Entertainment', who: 'B'}, false));
  const c2 = await p.evaluate(() => D().expenses.find(e => e.id === 'x2').cat);
  console.log(c === 'Fulfillment' && c2 === 'Fulfillment' ? 'RENAME OK' : 'FAIL ' + c + ' ' + c2, errs); await b.close(); })();
