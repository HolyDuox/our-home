const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  await p.evaluate(() => { go('calendar'); st.planView = 'watch'; render(); });
  for (const [t, ty, wh] of [['Oppenheimer', 'Movie', 'Prime Video'], ['Squid Game', 'Series', 'Netflix'], ['Dune: Part Two', 'Movie', 'Cinema']]) {
    await p.evaluate(() => watchSheet()); await p.fill('#wt', t); await p.click(`#wty [data-t="${ty}"]`); await p.selectOption('#ww', wh); await p.evaluate(() => saveWatch('')); }
  const sq = await p.evaluate(() => D().watch.find(w => w.title === 'Squid Game').id);
  await p.evaluate(id => { const w = D().watch.find(x => x.id === id); w.status = 'watching'; w.season = 2; w.ep = 3; DB.save(); st.watchStat = 'want'; render(); }, sq);
  await p.waitForTimeout(200); await p.screenshot({ path: 'p1.png' });
  await p.evaluate(() => pickWatch()); await p.waitForTimeout(200); await p.screenshot({ path: 'p2.png' }); await p.evaluate(() => closeSheet());
  await p.evaluate(() => { st.planView = 'act'; render(); });
  for (const [t, c, pl, cost, d] of [['White-water rafting', 'Water', 'Gopeng', 180, '2026-12-06'], ['Paintball', 'Adventure', 'Kota Damansara', 90, ''], ['Hot air balloon', 'Adventure', 'Putrajaya', 450, '']]) {
    await p.evaluate(() => actSheet()); await p.fill('#at', t); await p.click(`#aty [data-t="${c}"]`); await p.fill('#ap', pl); await p.fill('#ac', String(cost)); if (d) await p.fill('#ad', d); await p.evaluate(() => saveAct('')); }
  await p.waitForTimeout(200); await p.screenshot({ path: 'p3.png' });
  console.log('event in calendar:', await p.evaluate(() => D().events.map(e => e.title + ' ' + e.date)));
  const pb = await p.evaluate(() => D().activities.find(a => a.title === 'Paintball').id);
  await p.evaluate(id => actDone(id), pb); await p.waitForTimeout(200); await p.screenshot({ path: 'p4.png' });
  await p.evaluate(() => { closeSheet(); st.planView = 'cal'; st.calY = 2026; st.calM = 11; st.calSel = '2026-12-06'; render(); }); await p.waitForTimeout(200); await p.screenshot({ path: 'p5.png' });
  console.log('errors', errs); await b.close(); })();
