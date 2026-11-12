const { chromium } = require('playwright'); const fs = require('fs');
const URL = 'file:///mnt/project-files/family-app/index.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(3000);
  console.log('splash hidden w/o pin:', await p.evaluate(() => getComputedStyle(document.getElementById('splash')).display === 'none'));
  // big data so localStorage copy is dropped + pin set
  await p.evaluate(async () => { S().startDate = '2020-05-01'; S().pinHash = await sha('1234'); for (let i = 0; i < 70000; i++) D().expenses.push({id: uid(), amount: 1, date: '2026-01-01', cat: 'Food', who: 'A', note: 'Lunch at somewhere nice'}); 
    const c = document.createElement('canvas'); c.width = c.height = 50; c.getContext('2d').fillRect(0, 0, 50, 50); const id = uid(); await IMG.put(id, c.toDataURL()); D().memories.push({id, title: 'pic', date: '2025-01-01', likes: 0}); DB.save(); });
  await p.waitForTimeout(1500);
  console.log('ls copy:', await p.evaluate(() => !!localStorage.getItem('ourhome.v1')));
  await p.reload(); await p.waitForTimeout(3500);
  const st1 = await p.evaluate(() => ({padShown: !document.getElementById('lockpad').hidden, splash: getComputedStyle(document.getElementById('splash')).display}));
  console.log('after reload with PIN (data only in IndexedDB):', JSON.stringify(st1));
  // wrong x5 -> lockout
  for (let i = 0; i < 5; i++) for (const k of '0000') await p.evaluate(k => pinKey(k), k);
  await p.waitForTimeout(300); console.log('label after 5 wrong:', await p.evaluate(() => document.getElementById('lpLabel').textContent));
  for (const k of '1234') await p.evaluate(k => pinKey(k), k); await p.waitForTimeout(300);
  console.log('correct during lockout ->', await p.evaluate(() => document.getElementById('lpLabel').textContent));
  await p.evaluate(() => { lock.until = 0; }); for (const k of '1234') await p.evaluate(k => pinKey(k), k); await p.waitForTimeout(900);
  console.log('unlocked:', await p.evaluate(() => getComputedStyle(document.getElementById('splash')).display === 'none'));
  // forgot pin flow
  await p.evaluate(() => { showPad('unlock'); pinAlt(); }); await p.fill('#lpq', '2020-05-02'); await p.click('text=Remove PIN'); await p.waitForTimeout(200);
  console.log('wrong date keeps PIN:', await p.evaluate(() => !!S().pinHash)); await p.fill('#lpq', '2020-05-01'); await p.click('text=Remove PIN'); await p.waitForTimeout(800);
  console.log('right date removes PIN:', await p.evaluate(() => !S().pinHash));
  // backup -> download -> wipe -> restore
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => backup())]); const path = await dl.path(); const j = JSON.parse(fs.readFileSync(path, 'utf8'));
  console.log('backup: expenses', j.expenses.length, 'photos', Object.keys(j.__images).length, 'MB', (fs.statSync(path).size / 1e6).toFixed(1));
  await p.evaluate(async () => { localStorage.clear(); const db = await IMG.open(); await new Promise(r => { const t = db.transaction('img', 'readwrite'); t.objectStore('img').clear(); t.oncomplete = r; }); });
  await p.reload(); await p.waitForTimeout(3000); console.log('wiped expenses:', await p.evaluate(() => D().expenses.length));
  await p.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); });
  const inp = await p.$('input[type=file][onchange*="restore"]'); await inp.setInputFiles(path); await p.waitForTimeout(2500);
  console.log('restored expenses:', await p.evaluate(() => D().expenses.length), 'photo back:', await p.evaluate(async () => !!(await IMG.get(D().memories[0].id))));
  // garbage + old-version backup
  fs.writeFileSync('/tmp/claude-0/-home-user/f6456678-5a48-5cc3-93f2-44bcabb12173/scratchpad/stress/bad.json', 'hello');
  fs.writeFileSync('/tmp/claude-0/-home-user/f6456678-5a48-5cc3-93f2-44bcabb12173/scratchpad/stress/old.json', JSON.stringify({settings: {nameA: 'Old', babyName: 'Ammar', babyDob: '2025-01-01'}, growth: [{id: 'g', date: '2025-06-01', weight: '7'}], tasks: []}));
  await (await p.$('input[type=file][onchange*="restore"]')).setInputFiles('/tmp/claude-0/-home-user/f6456678-5a48-5cc3-93f2-44bcabb12173/scratchpad/stress/bad.json'); await p.waitForTimeout(500);
  console.log('after garbage still has expenses:', await p.evaluate(() => D().expenses.length));
  await p.evaluate(() => render()); await (await p.$('input[type=file][onchange*="restore"]')).setInputFiles('/tmp/claude-0/-home-user/f6456678-5a48-5cc3-93f2-44bcabb12173/scratchpad/stress/old.json'); await p.waitForTimeout(800);
  console.log('old backup ->', await p.evaluate(() => JSON.stringify({name: S().nameA, kids: D().kids.map(k => [k.name, k.growth.length])})));
  console.log('errors:', errs); await b.close();
})();
