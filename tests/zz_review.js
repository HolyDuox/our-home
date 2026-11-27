const { chromium } = require('playwright'); const { open } = require('./common'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  const pic = 'data:image/jpeg;base64,' + fs.readFileSync('../pic.jpg').toString('base64');
  // photos removed + saved are freed
  await p.evaluate(async pic => { for (const i of ['q1', 'q2', 'q3']) await IMG.put(i, pic); D().routines = [{id: 'r', name: 'R', type: 'Gym', who: 'A', days: [], photos: ['q1', 'q2', 'q3']}]; D().notes = [{id: 'n', title: 'N', body: '', photos: ['q1x']}]; await IMG.put('q1x', pic); go('more', 'Exercise'); st.xTab = 'routines'; render(); routineSheet('r'); }, pic);
  await p.waitForTimeout(300); await p.click('#nph .rm'); await p.evaluate(() => saveRoutine('r')); await p.waitForTimeout(300);
  ok(await p.evaluate(async () => !(await IMG.get('q1')) && !!(await IMG.get('q2')) && D().routines[0].photos.length === 2), 'photo removed from a routine is freed from the phone; others kept');
  await p.evaluate(() => { go('more', 'Notes'); noteSheet('n'); }); await p.waitForTimeout(300); await p.click('#nph .rm'); await p.evaluate(() => saveNote('n')); await p.waitForTimeout(300);
  ok(await p.evaluate(async () => !(await IMG.get('q1x'))), 'same for notes');
  await p.evaluate(() => { routineSheet('r'); noteImgs.splice(0, 2); closeSheet(); }); await p.waitForTimeout(200); ok(await p.evaluate(async () => !!(await IMG.get('q2')) && D().routines[0].photos.length === 2), 'closing without Save frees nothing');
  // stale measurement note
  await p.evaluate(() => { S().me = 'A'; D().body = [{id: 'o', who: 'A', date: addDaysISO(todayISO(), -120), waist: 85}, {id: 'nw', who: 'A', date: todayISO(), weight: 65}]; D().bodygoals = {A: {height: 165, sex: 'M'}}; go('more', 'Exercise'); st.xTab = 'body'; render(); });
  let t = await p.evaluate(() => document.getElementById('app').innerText); ok(/Using older numbers for waist/.test(t) && !/older numbers for weight/.test(t), 'warns that the waist is 4 months old, not the weight');
  await p.evaluate(() => { D().body[0].date = todayISO(); render(); }); t = await p.evaluate(() => document.getElementById('app').innerText); ok(!/older numbers/.test(t), 'no warning when everything is recent');
  // waist ÷ hips gap
  await p.evaluate(() => { D().body = [{id: 'h', who: 'A', date: todayISO(), weight: 65, waist: 92, hips: 96}]; render(); }); t = await p.evaluate(() => document.getElementById('app').innerText);
  ok(/6\.1 cm off your waist to reach healthy/.test(t), 'waist ÷ hips now says how many cm to lose: ' + (t.match(/[\d.]+ cm off your waist to reach healthy/g) || []).join(' / '));
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
