// Stress run 4: Exercise, Body + health check, routine photos, holidays, backup/restore, sync round-trip
const { chromium } = require('playwright'); const { open, NASTY } = require('./common'); const fs = require('fs');
const res = []; const ok = (c, m) => { res.push(!!c); console.log(c ? 'ok  ' : 'FAIL', m); };
const bad = t => /NaN|Infinity|undefined|Invalid Date|\[object/.test(t);
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b);
  const txt = () => p.evaluate(() => document.getElementById('app').innerText);
  const svgBad = () => p.evaluate(() => [...document.querySelectorAll('#app svg *')].some(e => [...e.attributes].some(a => /NaN|Infinity/.test(a.value))));
  const ex = async tab => { await p.evaluate(tab => { closeSheet(); go('more', 'Exercise'); st.xTab = tab; render(); }, tab); await p.waitForTimeout(60); return txt(); };
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; S().me = 'A'; });

  // ---------- BODY: chart edge cases ----------
  const chartCase = async (label, rows) => { await p.evaluate(r => { D().body = r; D().bodygoals = {A: {weight: 70, height: 165, sex: 'M'}}; st.bWho = 'A'; }, rows); const t = await ex('body'); ok(!bad(t) && !(await svgBad()) && !errs.length, label); };
  await chartCase('chart: all weights identical', [1, 2, 3].map(i => ({id: 'a' + i, who: 'A', date: `2026-1${i}-01`, weight: 70})));
  await chartCase('chart: several entries on the same date', [1, 2, 3].map(i => ({id: 'b' + i, who: 'A', date: '2026-11-01', at: i, weight: 70 + i})));
  await chartCase('chart: broken date strings mixed in', [{id: 'c1', who: 'A', date: 'bad-date', weight: 80}, {id: 'c2', who: 'A', date: '2026-11-01', weight: 78}, {id: 'c3', who: 'A', date: '', weight: 77}]);
  await chartCase('chart: huge and tiny weights (1e9, 0.1)', [{id: 'd1', who: 'A', date: '2026-01-01', weight: 1e9}, {id: 'd2', who: 'A', date: '2026-02-01', weight: 0.1}]);
  await chartCase('chart: goal far outside the data', [{id: 'e1', who: 'A', date: '2026-01-01', weight: 70}, {id: 'e2', who: 'A', date: '2026-02-01', weight: 71}].map(x => x));
  // ---------- BODY: health check edge cases ----------
  const hc = (rows, goals) => p.evaluate(([r, g]) => { D().body = r; D().bodygoals = {A: g}; return healthChecks('A').out.map(c => c.k + '=' + c.v + ' ' + c.tx); }, [rows, goals]);
  let h = await hc([{id: 'x', who: 'A', date: '2026-11-27', waist: 80}], {height: 165, sex: 'M'}); ok(h.length === 2 && h.some(x => x.startsWith('Waist ÷ height')), 'only waist + height (no weight): waist checks only');
  h = await hc([{id: 'x', who: 'A', date: '2026-11-27', weight: 60}], {height: 165}); ok(h.length === 1 && /BMI=22 Healthy/.test(h[0]), 'no sex chosen: BMI still works (' + h + ')');
  h = await hc([{id: 'x', who: 'A', date: '2026-11-27', weight: 60, bodyfat: 0}], {height: 0, sex: 'M'}); ok(h.length === 0, 'height 0 / body fat 0 ignored, no crash');
  h = await hc([{id: 'x', who: 'A', date: '2026-11-27', weight: 'abc', waist: -3}], {height: 'x', sex: 'Q'}); ok(Array.isArray(h) && h.length === 0, 'junk values give no checks, no crash');
  h = await hc([{id: 'x', who: 'A', date: '2026-11-27', weight: 64.6, waist: 82.5, hips: 91.7}], {height: 165, sex: 'M'});
  ok(h.includes('Waist ÷ height=0.50 Increased risk') && h.includes('BMI=23.7 Overweight'), 'exact boundary values (0.50, BMI 23.7): ' + h.join(' | '));
  h = await hc([{id: 'x', who: 'A', date: '2026-11-27', weight: 62.3, waist: 82}], {height: 165, sex: 'M'}); ok(h.includes('BMI=22.9 Healthy') && h.includes('Waist ÷ height=0.50 Increased risk'), 'BMI 22.9 is still healthy; 82/165 rounds to 0.50: ' + h.join(' | '));
  // inline height/sex on the card
  await p.evaluate(() => { D().body = [{id: 'y', who: 'B', date: todayISO(), weight: 55, waist: 75}]; D().bodygoals = {}; st.bWho = 'B'; render(); });
  for (const v of ['', '0', '300', 'abc']) { await p.fill('#hc_h', v); await p.selectOption('#hc_s', 'F'); await p.click('button:has-text("Save")'); }
  ok(!(await p.evaluate(() => (D().bodygoals.B || {}).height)), 'inline form rejects empty / 0 / 300 / text height');
  await p.fill('#hc_h', '158,5'); await p.selectOption('#hc_s', 'F'); await p.click('button:has-text("Save")'); ok(await p.evaluate(() => D().bodygoals.B.height) === 158.5, 'inline height 158,5 read as 158.5');
  ok(await p.evaluate(() => !D().bodygoals.A), "saving Wife's height doesn't create one for Shaz");
  // edit latest / same-day merge across people
  await p.evaluate(() => { D().body = [{id: 'p1', who: 'A', date: todayISO(), weight: 70}, {id: 'p2', who: 'B', date: todayISO(), weight: 55}]; st.bWho = 'A'; render(); });
  await p.click('button:has-text("+ New")'); await p.fill('#b_waist', '84'); await p.click('.sheet button:has-text("Save")');
  ok(await p.evaluate(() => D().body.length === 2 && D().body.find(x => x.id === 'p1').waist === 84 && !D().body.find(x => x.id === 'p2').waist), "same-day merge only touches Shaz's entry, not Wife's");
  // 1000 rapid saves on the same day
  await p.evaluate(() => { for (let i = 0; i < 1000; i++) { bodySheet(); document.getElementById('b_weight').value = String(70 + (i % 10) / 10); saveBody('', 'A'); } });
  ok(await p.evaluate(() => D().body.filter(x => x.who === 'A' && x.date === todayISO()).length) === 1, '1000 quick saves on one day still one entry');

  // ---------- EXERCISE ----------
  await p.evaluate(() => { D().routines = Array.from({length: 500}, (_, i) => ({id: 'r' + i, name: 'Routine ' + i, type: ['Gym', 'Run', 'Swim', 'Nope'][i % 4], who: ['A', 'B', 'both'][i % 3], days: i % 5 ? [i % 7] : [], minutes: i, exercises: Array.from({length: 30}, (_, k) => 'Move ' + k).join('\n')}));
    const t = todayISO(); D().workouts = Array.from({length: 4000}, (_, i) => ({id: 'w' + i, date: addDaysISO(t, -Math.floor(i / 2)), who: ['A', 'B', 'both'][i % 3], type: 'Run', minutes: 30, km: 5, routineId: 'r' + (i % 600)})); D().fitgoals = Array.from({length: 300}, (_, i) => ({id: 'g' + i, title: 'Goal ' + i, type: 'Run', who: 'both', status: 'doing', date: addDaysISO(t, i - 150), done: i % 4 === 0, doneOn: t})); });
  for (const tab of ['week', 'routines', 'goals']) { const t0 = Date.now(); const t = await ex(tab); const ms = await p.evaluate(() => { const s = performance.now(); render(); return performance.now() - s; }); ok(!bad(t) && ms < 300, `${tab} with 500 routines / 4000 workouts / 300 goals: ${ms.toFixed(0)} ms`); }
  ok(await p.evaluate(() => { const s = performance.now(); xStreak('A'); xStreak('B'); return performance.now() - s; }) < 200, 'streak calculation over 5+ years is quick');
  await p.evaluate(() => { D().routines = D().routines.slice(0, 3); render(); }); ok(!errs.length && !bad(await txt()), 'workouts pointing at deleted routines still show fine');
  // future-dated workout and Sunday week edge
  ok(await p.evaluate(() => xWeekStart('2026-11-29') === '2026-11-23' && xWeekStart('2026-11-30') === '2026-11-30' && xWeekStart('2027-01-03') === '2026-12-28'), 'week runs Monday–Sunday (Sunday and New Year checked)');
  await p.evaluate(() => { D().workouts.push({id: 'fut', date: addDaysISO(todayISO(), 400), who: 'A', type: 'Gym', minutes: 10}); render(); }); ok(!bad(await txt()), 'workout dated next year is harmless');
  // routine done twice same day
  await p.evaluate(() => { D().routines = [{id: 'rt', name: 'Daily', type: 'Gym', who: 'both', days: [0, 1, 2, 3, 4, 5, 6], minutes: 20}]; D().workouts = []; st.xTab = 'week'; render(); xDoRoutine('rt'); });
  ok(await p.evaluate(() => !document.querySelector('#app button[onclick^="xDoRoutine"]')), 'after Done, the button is gone so it cannot be double-logged by accident');
  // routine with 20 photos
  const pic = 'data:image/jpeg;base64,' + fs.readFileSync('../pic.jpg').toString('base64');
  await p.evaluate(async pic => { const ids = []; for (let i = 0; i < 20; i++) { const id = 'ph' + i; await IMG.put(id, pic); ids.push(id); } D().routines[0].photos = ids; st.xTab = 'routines'; render(); }, pic);
  await p.waitForTimeout(500); ok(await p.evaluate(() => document.querySelectorAll('#app .thumb').length) === 4 && /\+16/.test(await txt()), 'routine with 20 photos shows 4 + "+16"');
  await p.evaluate(() => routineSheet('rt')); await p.waitForTimeout(400); ok(await p.evaluate(() => document.querySelectorAll('#nph .thumb:not(.add)').length) === 20, 'all 20 photos in the edit form'); await p.evaluate(() => closeSheet());
  // cancel editing doesn't lose photos
  await p.evaluate(() => { routineSheet('rt'); noteImgs.splice(0, 5); closeSheet(); }); ok(await p.evaluate(() => D().routines[0].photos.length) === 20, 'removing photos then closing without Save keeps them');
  // note editor and routine editor don't mix photos
  await p.evaluate(() => { routineSheet('rt'); closeSheet(); noteSheet(); }); ok(await p.evaluate(() => document.querySelectorAll('#nph .thumb:not(.add)').length) === 0, "a new note doesn't inherit the routine's photos"); await p.evaluate(() => closeSheet());

  // ---------- BACKUP / RESTORE with the new data ----------
  await p.evaluate(() => { D().body = [{id: 'bk', who: 'A', date: todayISO(), weight: 70, waist: 84}]; D().bodygoals = {A: {height: 165, sex: 'M', weight: 65}}; D().fitgoals = [{id: 'fg', title: 'Run 10K', type: 'Run', who: 'both', status: 'doing'}]; DB.save(); go('more', 'Settings'); });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => backup())]); const bpath = await dl.path(); const j = JSON.parse(fs.readFileSync(bpath, 'utf8'));
  ok(j.routines && j.workouts && j.body && j.bodygoals && j.fitgoals && j.__images && j.__images.ph0, 'backup file includes routines, workouts, body, goals and routine photos');
  await p.evaluate(async () => { D().routines = []; D().body = []; D().bodygoals = {}; D().fitgoals = []; for (let i = 0; i < 20; i++) await IMG.del('ph' + i); DB.save(); render(); });
  await (await p.$('input[type=file][onchange*="restore"]')).setInputFiles(bpath); await p.waitForTimeout(3000);
  ok(await p.evaluate(async () => D().routines.length === 1 && D().routines[0].photos.length === 20 && !!(await IMG.get('ph7')) && D().body.length === 1 && D().bodygoals.A.sex === 'M' && D().fitgoals.length === 1), 'restore brings back routines + photos, body entries, goals');

  // ---------- SYNC round-trip of the new collections ----------
  ok(await p.evaluate(() => { const m = syncCollect(); const rows = [...m.values()].filter(r => ['routines', 'workouts', 'fitgoals', 'body', 'bodygoals'].includes(r.coll));
    const keep = JSON.stringify({r: D().routines, w: D().workouts, f: D().fitgoals, b: D().body, g: D().bodygoals});
    D().routines = []; D().workouts = []; D().fitgoals = []; D().body = []; D().bodygoals = {};
    rows.forEach(r => syncApply(r.coll, r.id, JSON.parse(JSON.stringify(r.data)), false));
    const norm = x => JSON.stringify(x, Object.keys(x).sort());
    const back = {r: D().routines, w: D().workouts, f: D().fitgoals, b: D().body, g: D().bodygoals};
    const a = JSON.parse(keep); return ['r', 'w', 'f', 'b'].every(k => a[k].length === back[k].length) && JSON.stringify(a.g) === JSON.stringify(back.g); }), 'sync round-trip: every routine, workout, goal, body entry and per-person goal arrives intact');
  ok(await p.evaluate(() => { syncApply('body', 'bk', null, true); return !D().body.some(x => x.id === 'bk'); }), 'delete from the other phone removes the body entry');
  ok(await p.evaluate(() => { syncApply('bodygoals', 'B', {height: 158, sex: 'F'}, false); return D().bodygoals.B.height === 158 && D().bodygoals.A.sex === 'M'; }), "Wife's goals arriving don't overwrite Shaz's");

  // ---------- old data without the new sections ----------
  await p.evaluate(() => { const d = JSON.parse(JSON.stringify(D())); ['routines', 'workouts', 'fitgoals', 'body', 'bodygoals', 'gold', 'investments'].forEach(k => delete d[k]); DB.load(JSON.stringify(d)); attachKidViews && attachKidViews(); });
  for (const tab of ['week', 'routines', 'goals', 'body']) { const t = await ex(tab); ok(!bad(t) && !errs.length, `older data (before Exercise existed) opens ${tab} fine`); }

  // ---------- HOLIDAYS ----------
  ok(await p.evaluate(() => { const r = []; for (let y = 2026; y <= 2027; y++) for (let m = 0; m < 12; m++) { st.calY = y; st.calM = m; go('calendar'); st.planView = 'cal'; render(); r.push(document.querySelectorAll('.cal .d.hol').length); } return r.reduce((a, b) => a + b, 0) === Object.keys(HOLS).length; }), 'every holiday shows on its day across all 24 months');
  ok(await p.evaluate(() => { S().showHols = false; const n = upcomingItems(400).filter(x => x.kind.includes('holiday')).length; S().showHols = true; return n === 0; }), 'hiding holidays also hides them from Coming up');

  // ---------- small screen ----------
  const o = await open(b, {w: 320}); await o.p.evaluate(() => { S().me = 'A'; D().body = [{id: 'z', who: 'A', date: todayISO(), weight: 123.4, waist: 123.4, hips: 123.4, bodyfat: 33.3}]; D().bodygoals = {}; go('more', 'Exercise'); st.xTab = 'body'; render(); });
  ok(!(await o.p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Body with the inline height form fits a 320px screen'); await o.ctx.close();

  ok(!errs.length, 'no page errors overall ' + errs.slice(0, 3).join(' | '));
  console.log(`\n${res.filter(Boolean).length}/${res.length} passed`); await b.close(); })();
