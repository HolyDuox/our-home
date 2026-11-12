const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; go('calendar'); st.planView = 'karaoke'; render(); });
  for (const [t, a, w, l] of [['Perfect', 'Ed Sheeran', 'A', 'English'], ['Kau Ilhamku', 'Man Bai', 'A', 'Malay'], ['Shallow', 'Lady Gaga & Bradley Cooper', 'duet', 'English'], ['Rasa Sayang', '', 'any', 'Malay'], ['Someone Like You', 'Adele', 'B', 'English']]) {
    await p.evaluate(() => kSheet()); await p.fill('#kst', t); await p.fill('#ksa', a); await p.click(`#ksw [data-k="${w}"]`); await p.selectOption('#ksl', l); await p.evaluate(() => kSave('')); }
  await p.evaluate(() => { kFav(D().karaoke[2].id); kSang(D().karaoke[0].id); kSang(D().karaoke[0].id); }); await p.waitForTimeout(2000);
  await p.screenshot({ path: 'k1.png' }); await p.evaluate(() => kSetlist()); await p.waitForTimeout(200); await p.screenshot({ path: 'k2.png' });
  console.log(errs); await b.close(); })();
