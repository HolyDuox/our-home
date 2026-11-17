const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  await p.evaluate(() => { const t = todayISO(); D().expenses.push({id: uid(), amount: 85, date: t, cat: 'Entertainment', who: 'A', note: 'Cinema'}, {id: uid(), amount: 40, date: t, cat: 'Food', who: 'B', note: 'Lunch'}); DB.save(); go('money', 'Expenses'); });
  await p.waitForTimeout(300); const opts = await p.evaluate(() => { expSheet && expSheet(); return [...document.querySelectorAll('#xc option')].map(o => o.textContent); }).catch(e => 'n/a ' + e.message);
  console.log(opts); await p.evaluate(() => closeSheet()); await p.waitForTimeout(200); await p.screenshot({ path: '../ent.png' }); console.log(errs); await b.close(); })();
