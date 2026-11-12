const { chromium } = require('playwright'); const { start, CLIENT } = require('./fakeserver');
const URL = 'file:///mnt/project-files/family-app/index.html', PORT = 54400;
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = start(PORT); const b = await chromium.launch(); const errs = [];
  const phone = async (name) => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.addInitScript(CLIENT(PORT, name)); await p.goto(URL); await wait(400); await p.evaluate(() => hideSplash()); return p; };
  const A = await phone('A'), B = await phone('B');
  const check = (label, ok, extra = '') => console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
  const sig = p => p.evaluate(() => { const m = syncCollect(); const o = {}; for (const [k, v] of m) if (k !== 'activity|_' && !k.startsWith('activity|')) o[k] = hashOf(v.data); return o; });
  const same = async () => { const [a, b] = [await sig(A), await sig(B)]; const ka = Object.keys(a), kb = Object.keys(b); const diff = [...new Set([...ka, ...kb])].filter(k => a[k] !== b[k]); return diff; };
  const settle = async (ms = 3500) => { await A.evaluate(() => SYNC.schedule(0)); await B.evaluate(() => SYNC.schedule(0)); await wait(ms); await A.evaluate(() => SYNC.schedule(0)); await B.evaluate(() => SYNC.schedule(0)); await wait(1500); };
  // A has existing data
  await A.evaluate(async () => { S().nameA = 'Shaz'; S().nameB = 'Wife'; S().me = 'A'; S().theme = 'dark'; S().startDate = '2020-05-01';
    for (let i = 0; i < 30; i++) D().tasks.push({id: 'tA' + i, title: 'A task ' + i, done: false, by: 'A', who: 'both'});
    const k = newKid({id: 'kid1', name: 'Aisyah', dob: '2025-11-01', sex: 'girl'}); for (let i = 0; i < 500; i++) k.babylog.push({id: 'bl' + i, at: Date.now() - i * 3600e3, by: 'A', type: 'feed', sub: 'Bottle'}); D().kids.push(k); S().activeKid = 'kid1';
    D().meals['2026-11-12'] = {Dinner: 'Nasi lemak'};
    const c = document.createElement('canvas'); c.width = c.height = 40; c.getContext('2d').fillStyle = 'red'; c.getContext('2d').fillRect(0, 0, 40, 40); await IMG.put('memA', c.toDataURL());
    D().memories.push({id: 'memA', title: 'Beach', date: '2025-05-01', likes: 0, by: 'A'}); DB.save(); });
  await B.evaluate(() => { S().me = 'B'; S().theme = 'light'; D().tasks.push({id: 'tB0', title: 'B local task', done: false, by: 'B', who: 'both'}); DB.save(); });
  // A: sign up + create via the real UI
  await A.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); }); await wait(300);
  await A.fill('#se', 'shaz@example.com'); await A.fill('#spw', 'password123'); await A.click('text=Create account'); await wait(500);
  await A.click('text=Start our household'); await wait(2500);
  const code = await A.evaluate(() => SYNC.code); check('A created household, code shown', /^[A-Z0-9]{6}$/.test(code), code);
  // B: sign up + join
  await B.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); }); await wait(300);
  await B.fill('#se', 'wife@example.com'); await B.fill('#spw', 'password456'); await B.click('text=Create account'); await wait(500);
  await B.fill('#shc', code.toLowerCase()); await B.click('button:has-text("Join")'); await settle();
  let d = await same(); check('after join both phones identical', d.length === 0, d.slice(0, 5).join(','));
  check('B received A tasks + kid log + meals', await B.evaluate(() => D().tasks.length === 31 && D().kids[0]?.babylog.length === 500 && D().meals['2026-11-12']?.Dinner === 'Nasi lemak'));
  check('A received B local task', await A.evaluate(() => D().tasks.some(t => t.id === 'tB0')));
  check('names shared, phone-only settings kept', await B.evaluate(() => S().nameA === 'Shaz' && S().me === 'B' && S().theme === 'light') && await A.evaluate(() => S().me === 'A' && S().theme === 'dark'));
  check('photo reached B', await B.evaluate(async () => (await IMG.get('memA') || '').startsWith('data:image')));
  // concurrent edits on different records
  await A.evaluate(() => { D().tasks.find(t => t.id === 'tA1').done = true; DB.save(); });
  await B.evaluate(() => { D().tasks.find(t => t.id === 'tA2').title = 'Edited by B'; D().kids[0].babylog.push({id: 'blB', at: Date.now(), by: 'B', type: 'diaper', sub: 'Wet'}); DB.save(); });
  await settle(); d = await same();
  check('simultaneous edits on different records both kept', d.length === 0 && await A.evaluate(() => D().tasks.find(t => t.id === 'tA2').title === 'Edited by B' && D().kids[0].babylog.some(x => x.id === 'blB')) && await B.evaluate(() => D().tasks.find(t => t.id === 'tA1').done === true));
  // same record edited on both
  await A.evaluate(() => { D().tasks.find(t => t.id === 'tA3').title = 'A wins?'; DB.save(); }); await B.evaluate(() => { D().tasks.find(t => t.id === 'tA3').title = 'B wins?'; DB.save(); });
  await settle(); d = await same(); check('same record edited on both: phones agree', d.length === 0, await A.evaluate(() => D().tasks.find(t => t.id === 'tA3').title));
  // delete propagates
  await A.evaluate(() => { D().tasks = D().tasks.filter(t => t.id !== 'tA4'); DB.save(); }); await settle();
  check('delete on A removed on B', await B.evaluate(() => !D().tasks.some(t => t.id === 'tA4')));
  // offline
  await srvOffline('B', true);
  await B.evaluate(() => { for (let i = 0; i < 3; i++) D().tasks.push({id: 'off' + i, title: 'offline ' + i, done: false}); D().tasks = D().tasks.filter(t => t.id !== 'tA5'); DB.save(); });
  await A.evaluate(() => { D().tasks.push({id: 'onA1', title: 'A while B offline', done: false}, {id: 'onA2', title: 'A again', done: false}); DB.save(); });
  await settle(3000);
  check('B shows offline status, keeps its changes', await B.evaluate(() => SYNC.status === 'error' && D().tasks.some(t => t.id === 'off0')), await B.evaluate(() => SYNC.err));
  // B reloads while offline (changes must survive), then comes online
  await B.reload(); await wait(800); await B.evaluate(() => hideSplash());
  check('B offline changes survive reload', await B.evaluate(() => D().tasks.filter(t => t.id.startsWith('off')).length === 3));
  await srvOffline('B', false); await settle(5000); d = await same();
  check('after reconnect phones identical', d.length === 0, d.slice(0, 4).join(','));
  check('offline adds + delete reached A', await A.evaluate(() => D().tasks.filter(t => t.id.startsWith('off')).length === 3 && !D().tasks.some(t => t.id === 'tA5')));
  // kid added on B
  await B.evaluate(() => { D().kids.push(newKid({id: 'kid2', name: 'Adam', dob: '2018-06-15', sex: 'boy'})); DB.save(); }); await settle();
  check('new child on B appears on A', await A.evaluate(() => D().kids.some(k => k.id === 'kid2')));
  // safety: B suddenly empty (simulated bug) must not wipe server
  const before = await (await fetch(`http://127.0.0.1:${PORT}/_stats`, {method: 'POST'})).json();
  await B.evaluate(() => { D().tasks = []; D().kids = []; D().memories = []; DB.save(); }); await wait(3500);
  const after = await (await fetch(`http://127.0.0.1:${PORT}/_stats`, {method: 'POST'})).json();
  check('empty phone cannot wipe shared data (push paused)', after.live === before.live, `${before.live} -> ${after.live} · ${await B.evaluate(() => SYNC.err)}`);
  await B.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); }); await B.screenshot({ path: 'sync-b-paused.png' });
  await B.evaluate(() => syncRepair()); await settle(4000); d = await same();
  check('repair brings shared data back, phones identical', d.length === 0 && await B.evaluate(() => D().tasks.length > 30 && D().kids.length === 2), d.slice(0, 4).join(','));
  // UI render on both with sync card
  await A.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); }); await A.screenshot({ path: 'sync-a.png' });
  console.log('server', JSON.stringify(after)); console.log('errors:', errs);
  await b.close(); srv.close();
  async function srvOffline(phone, off) { await fetch(`http://127.0.0.1:${PORT}/_offline`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone, off})}); }
})();
