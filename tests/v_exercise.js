const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); let f = 0; const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) f++; };
  const txt = () => p.evaluate(() => document.getElementById('app').innerText); const bad = t => /NaN|undefined|Infinity|\[object/.test(t);
  await p.evaluate(() => { S().nameA = 'Shaz'; S().nameB = 'Wife'; S().me = 'A'; go('more', 'Exercise'); });
  ok(/Exercise/.test(await txt()) && !bad(await txt()), 'empty Exercise page renders');
  // routine via the form
  await p.evaluate(() => { st.xTab = 'routines'; render(); routineSheet(); }); await p.fill('#rn', "Leg day"); await p.selectOption('#rt', 'Gym'); await p.selectOption('#rw', 'A');
  const dow = await p.evaluate(() => new Date().getDay()); await p.click(`#rdays [data-d="${dow}"]`); await p.click(`#rdays [data-d="${(dow + 2) % 7}"]`); await p.fill('#rm', '45'); await p.fill('#rx', 'Squat 3×10 · 40 kg\nLunges 3×12\nPlank 3×45s'); await p.evaluate(() => saveRoutine(''));
  ok(await p.evaluate(() => D().routines.length === 1 && D().routines[0].days.length === 2 && D().routines[0].minutes === 45), 'routine saved with 2 days and minutes');
  await p.evaluate(() => routineSheet()); await p.fill('#rn', ''); await p.evaluate(() => saveRoutine('')); ok(await p.evaluate(() => D().routines.length) === 1, 'routine without a name rejected'); await p.evaluate(() => closeSheet());
  await p.evaluate(() => { routineSheet(); }); await p.fill('#rn', 'Couple jog'); await p.selectOption('#rt', 'Run'); await p.selectOption('#rw', 'both'); await p.fill('#rm', '30'); await p.evaluate(() => saveRoutine(''));
  // today's plan + Done
  await p.evaluate(() => { st.xTab = 'week'; render(); }); let t = await txt(); ok(/Today's plan/.test(t) && /Leg day/.test(t), "today's plan shows the routine for today");
  await p.evaluate(() => xDoRoutine(D().routines[0].id)); t = await txt(); ok(/Done ✓/.test(t) && /1\s*workout/.test(t), 'Done logs a workout and counts it');
  // log via form, with comma decimal and feel
  await p.evaluate(() => workoutSheet()); await p.selectOption('#wr', await p.evaluate(() => D().routines[1].id)); ok(await p.inputValue('#wt') === 'Couple jog' && await p.inputValue('#ww') === 'both', 'picking a routine fills the form');
  await p.fill('#wk', '5,2'); await p.click('#wf [data-f="4"]'); await p.fill('#wn', "New best!"); await p.evaluate(() => saveWorkout(''));
  const w = await p.evaluate(() => D().workouts.at(-1)); ok(w.km === 5.2 && w.feel === 4 && w.who === 'both' && w.routineId, 'workout saved (5,2 km read as 5.2, feel 4, together)');
  t = await txt(); ok(/Shaz[\s\S]*2\s*workouts/.test(t), 'together workout counts for both people');
  // streak over weeks
  await p.evaluate(() => { const t = todayISO(); for (let k = 1; k <= 3; k++) D().workouts.push({id: 'old' + k, date: addDaysISO(t, -7 * k), who: 'B', type: 'Yoga', title: 'Yoga', minutes: 30}); D().workouts.push({id: 'gap', date: addDaysISO(t, -7 * 6), who: 'B', type: 'Yoga', minutes: 30}); render(); });
  ok(await p.evaluate(() => xStreak('B')) === 4, 'streak: 4 weeks in a row for Wife (gap stops it) = ' + await p.evaluate(() => xStreak('B')));
  ok(await p.evaluate(() => xStreak('A')) >= 1, 'streak for Shaz');
  // goals
  await p.evaluate(() => { st.xTab = 'goals'; render(); fitSheet(); }); await p.fill('#ft', 'Run a 10K'); await p.selectOption('#fs', 'doing'); await p.fill('#fd', await p.evaluate(() => addDaysISO(todayISO(), 30))); await p.evaluate(() => saveFit(''));
  t = await txt(); ok(/Run a 10K/.test(t) && /30 days to go/.test(t), 'goal shows days to go');
  await p.evaluate(() => fitDone(D().fitgoals[0].id)); t = await txt(); ok(/Done 🎉/.test(t), 'ticking a goal moves it to Done');
  await p.evaluate(() => fitDone(D().fitgoals[0].id)); ok(await p.evaluate(() => !D().fitgoals[0].done), 'untick works');
  // weird data
  await p.evaluate(N => { N.forEach((n, i) => { D().routines.push({id: 'r' + i, name: n, type: i % 2 ? 'Nope' : 'Swim', who: ['A', 'B', 'both', 'zzz'][i % 4], days: i % 3 ? [] : [0, 6], exercises: n, note: n}); D().workouts.push({id: 'w' + i, date: i % 2 ? '2024-02-29' : todayISO(), who: 'A', type: 'Nope', title: n, note: n, minutes: 'abc'}); D().fitgoals.push({id: 'f' + i, title: n, type: 'Run', who: 'B', status: 'doing', date: '2020-01-01', note: n}); }); }, NASTY);
  for (const x of ['week', 'routines', 'goals']) { await p.evaluate(x => { st.xTab = x; render(); }, x); t = await txt(); ok(!bad(t.replace(/undefined_ok/g, '')) && !(await p.evaluate(() => document.querySelector('#app script'))), `weird names/types render safely on ${x}`); }
  for (const id of ['r1', 'w1', 'f1']) await p.evaluate(id => { id[0] === 'r' ? (routineSheet(id), saveRoutine(id)) : id[0] === 'w' ? (workoutSheet(id), saveWorkout(id)) : (fitSheet(id), saveFit(id)); }, id);
  ok(!errs.length, 'open + save weird items without errors');
  // delete
  await p.evaluate(() => { st.xTab = 'routines'; render(); routineSheet(D().routines[0].id); }); await p.click('.sheet button.red'); await p.click('.sheet button.red'); ok(await p.evaluate(() => !D().routines.some(r => r.name === 'Leg day')), 'delete routine');
  // search
  await p.evaluate(() => { st.q = 'Couple'; go('home'); }); 
  // 2 years of daily workouts speed
  await p.evaluate(() => { const t = todayISO(); for (let k = 0; k < 1500; k++) D().workouts.push({id: 'bulk' + k, date: addDaysISO(t, -Math.floor(k / 2)), who: k % 2 ? 'A' : 'B', type: 'Run', minutes: 30, km: 5}); go('more', 'Exercise'); st.xTab = 'week'; });
  const ms = await p.evaluate(() => { const s = performance.now(); render(); return performance.now() - s; }); ok(ms < 200, `2 years of daily workouts: page renders in ${ms.toFixed(0)} ms`);
  // sync: collections included
  ok(await p.evaluate(() => { const m = syncCollect(); const c = new Set([...m.values()].map(x => x.coll)); return c.has('routines') && c.has('workouts') && c.has('fitgoals'); }), 'routines, workouts and goals sync between phones');
  await p.evaluate(() => { st.xTab = 'week'; D().workouts = D().workouts.filter(w => !/^(bulk|w\d)/.test(w.id)); render(); window.scrollTo(0, 0); }); await p.screenshot({ path: '../ex1.png' });
  await p.evaluate(() => { st.xTab = 'routines'; render(); }); await p.screenshot({ path: '../ex2.png' });
  await p.evaluate(() => { st.xTab = 'goals'; D().fitgoals = D().fitgoals.filter(g => !/^f\d/.test(g.id)); D().fitgoals.push({id: 'g2', title: 'Try Muay Thai', type: 'Other', who: 'A', status: 'want', note: 'Trial class at the gym'}); render(); }); await p.screenshot({ path: '../ex3.png' });
  for (const w of [320]) { const o = await open(b, {w}); await o.p.evaluate(() => { D().routines.push({id: 'x', name: 'A very long routine name '.repeat(5), type: 'Gym', who: 'both', days: [0, 1, 2, 3, 4, 5, 6], exercises: 'x'.repeat(200)}); go('more', 'Exercise'); });
    ok(!(await o.p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no sideways scroll at 320px'); await o.ctx.close(); }
  console.log(errs, f ? 'FAILED' : 'ALL OK'); await b.close(); })();
