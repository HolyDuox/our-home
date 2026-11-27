const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  const chk = (w) => p.evaluate(w => Object.fromEntries(healthChecks(w).out.map(c => [c.k, c.v + ' ' + c.tx])), w);
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; S().me = 'A'; go('more', 'Exercise'); st.xTab = 'body'; render(); });
  await p.evaluate(() => { D().body = [{id: 'pre', who: 'A', date: todayISO(), weight: 70, waist: 85}]; render(); });
  ok(/I need your height and male/.test(await p.evaluate(() => document.getElementById('app').innerText)), 'measurements entered but no height: asks on the card');
  await p.fill('#hc_h', '50'); await p.selectOption('#hc_s', 'M'); await p.click('text=Save'); ok(!(await p.evaluate(() => (D().bodygoals.A || {}).height)), 'silly height rejected');
  await p.fill('#hc_h', '172'); await p.click('button:has-text("Save")'); await p.waitForTimeout(100);
  ok(/Waist ÷ height/.test(await p.evaluate(() => document.getElementById('app').innerText)) && !(await p.evaluate(() => document.getElementById('hc_h'))), 'after saving on the card the checks appear straight away');
  ok(await p.evaluate(() => D().bodygoals.A.sex) === 'M', 'sex saved in goals');
  const cases = [  // [weight, waist, hips, bodyfat] -> expectations
    [[65, 80, 95, 15], {'BMI': '22 Healthy', 'Waist ÷ height': '0.47 Healthy', 'Waist': '80 cm Healthy', 'Waist ÷ hips': '0.84 Healthy', 'Body fat': '15% Fit'}],
    [[72, 88, 98, 20], {'BMI': '24.3 Overweight', 'Waist ÷ height': '0.51 Increased risk', 'Waist': '88 cm Healthy', 'Body fat': '20% Average'}],
    [[85, 104, 100, 28], {'BMI': '28.7 Obese', 'Waist ÷ height': '0.60 High risk', 'Waist': '104 cm Above Asian limit', 'Waist ÷ hips': '1.04 Increased risk', 'Body fat': '28% High'}],
    [[52, 66, 88, 9], {'BMI': '17.6 Underweight', 'Waist ÷ height': '0.38 Very slim'}]];
  for (const [[wt, wa, hi, bf], exp] of cases) { await p.evaluate(([wt, wa, hi, bf]) => { D().body = [{id: 'c', who: 'A', date: todayISO(), weight: wt, waist: wa, hips: hi, bodyfat: bf}]; }, [wt, wa, hi, bf]);
    const got = await chk('A'); const bad = Object.entries(exp).filter(([k, v]) => got[k] !== v); ok(!bad.length, `${wt} kg, waist ${wa}: ` + (bad.length ? JSON.stringify(bad.map(([k, v]) => [k, v, got[k]])) : 'all categories right')); }
  // women's cut-offs
  await p.evaluate(() => { D().bodygoals.B = {height: 158, sex: 'F'}; D().body.push({id: 'w', who: 'B', date: todayISO(), weight: 55, waist: 82, hips: 96, bodyfat: 27}); });
  const gb = await chk('B'); ok(gb['Waist'] === '82 cm Above Asian limit' && gb['Waist ÷ hips'] === '0.85 Increased risk' && gb['Body fat'] === '27% Average' && gb['BMI'] === '22 Healthy', "women's cut-offs: " + JSON.stringify(gb));
  // healthy range text
  await p.evaluate(() => render()); const t = await p.evaluate(() => document.getElementById('app').innerText); ok(/54\.7–67\.7 kg/.test(t) && /under 86 cm/.test(t), 'shows healthy weight range 54.7–67.7 kg and waist target under 86 cm for 172 cm');
  ok(!/NaN|undefined|null/.test(t), 'no broken numbers');
  // routine photos
  await p.evaluate(() => { st.xTab = 'routines'; render(); routineSheet(); }); await p.fill('#rn', 'Push day');
  await p.setInputFiles('#nph input[type=file]', ['../pic.jpg', '../pic.jpg']); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelectorAll('#nph .thumb:not(.add)').length) === 2, 'two photos added to the routine form');
  await p.fill('#rno', 'Keep elbows in\nSlow on the way down'); await p.evaluate(() => saveRoutine(''));
  const r = await p.evaluate(() => D().routines.at(-1)); ok(r.photos.length === 2 && /\n/.test(r.note), 'routine saved with 2 photos and a multi-line note');
  await p.waitForTimeout(400); ok(await p.evaluate(() => document.querySelectorAll('#app .thumb[data-done]').length) === 2, 'photos show in the routine list');
  ok(await p.evaluate(id => IMG.get(id).then(x => !!x), r.photos[0]), 'photo stored');
  await p.evaluate(() => routineSheet(D().routines.at(-1).id)); await p.waitForTimeout(300); ok(await p.evaluate(() => document.querySelectorAll('#nph .thumb:not(.add)').length) === 2, 'photos show again when editing');
  await p.click('#nph .rm'); await p.evaluate(() => saveRoutine(D().routines.at(-1).id)); ok(await p.evaluate(() => D().routines.at(-1).photos.length) === 1, 'remove one photo');
  const pid = await p.evaluate(() => D().routines.at(-1).photos[0]); await p.evaluate(() => routineSheet(D().routines.at(-1).id)); await p.click('.sheet button.red'); await p.click('.sheet button.red'); await p.waitForTimeout(300);
  ok(await p.evaluate(id => IMG.get(id).then(x => !x), pid), 'deleting the routine deletes its photos');
  // old routine without photos still opens
  await p.evaluate(() => { D().routines.push({id: 'old', name: 'Old', type: 'Run', who: 'A', days: [1], note: 'x'}); render(); routineSheet('old'); saveRoutine('old'); }); ok(!errs.length, 'old routines without photos still open and save');
  await p.evaluate(() => { D().body = [{id: 'c', who: 'A', date: todayISO(), weight: 72, waist: 88, hips: 98, bodyfat: 20}]; D().bodygoals.A.weight = 68; st.xTab = 'body'; st.bWho = 'A'; render(); window.scrollTo(0, 330); }); await p.screenshot({ path: '../hc.png' });
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
