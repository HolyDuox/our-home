const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
const VIEWS = [['home', ''], ['tasks', ''], ['restock', "st.restockView='list'"], ['restock', "st.restockView='meals'"], ['restock', "st.restockView='recipes'"], ['calendar', `st.planView='cal';st.calSel=todayISO()`], ['calendar', "st.planView='watch';st.watchStat='want'"], ['calendar', "st.planView='watch';st.watchStat='watching'"], ['calendar', "st.planView='act';st.actStat='todo'"], ['calendar', "st.planView='act';st.actStat='done'"],
  ...['Overview','Expenses','Bills','Savings goals','Wishlist'].map(m => ['money', `st.money='${m}'`]), ['money', "st.money='Bills';st.commitView='scheduled'"],
  ...['Memories','Notes','Car','Contacts','Settings'].map(m => ['more', `st.more='${m}'`]),
  ...['Today','Growth','Vaccines','Milestones','School','Chores'].map(t => ['kids', `st.babyTab='${t}';st.openBand=-1`]), ['kids', "st.babyTab='Milestones';st.openBand=0"], ['kids', "S().activeKid=D().kids[1].id;st.babyTab='Growth'"]];
(async () => {
  const b = await chromium.launch(); const { p, errs } = await open(b);
  await p.evaluate(N => { const d = D(), t = todayISO(); let i = 0; const n = () => N[i++ % N.length];
    S().nameA = N[0]; S().nameB = N[1]; S().startDate = t.replace(/^\d{4}/, y => y - 2);
    N.forEach((x, j) => { const k = newKid({name: x.slice(0, 40), dob: j % 2 ? '2024-02-29' : '2019-12-31', sex: j % 2 ? 'girl' : 'boy'}); k.milestones[x] = t; k.growth.push({id: uid(), date: t, weight: '12', height: '88'});
      k.school = {name: x, cls: x, teacher: x, phone: x}; k.classes = [{id: uid(), title: x, days: [0,1,2,3,4,5,6], time: '15:00', place: x}]; k.dates = [{id: uid(), title: x, date: t, type: 'Exam'}];
      k.chores = [{id: uid(), title: x, reward: 1, repeat: 'daily'}]; d.kids.push(k); });
    S().activeKid = d.kids[0].id;
    d.restockCats.push(N[0], N[6]);
    N.forEach(x => { d.tasks.push({id: uid(), title: x, due: t, done: false, by: 'A', who: 'both'}); d.restock.push({id: uid(), name: x, cat: d.restockCats[i++ % d.restockCats.length], links: [x], by: 'A', done: false});
      d.events.push({id: uid(), title: x, date: t, note: x}); d.bills.push({id: uid(), name: x, type: 'Loan', amount: 100, dueDay: 31, payer: 'both', paid: [], paidOn: {}});
      d.scheduled.push({id: uid(), name: x, type: 'Insurance', amount: 50, next: t, freq: 'yearly', payer: 'both', done: false});
      d.expenses.push({id: uid(), amount: 10, date: t, cat: 'Food', who: 'A', note: x}); d.notes.push({id: uid(), title: x, body: x, pin: false, updated: Date.now(), by: 'A', photos: []});
      d.recipes.push({id: uid(), name: x, section: 'General', ingredients: [x, 'Egg'], steps: x, by: 'A'}); d.wishes.push({id: uid(), name: x, price: 10, cat: x, link: x, by: 'A'});
      d.goals.push({id: uid(), name: x, target: 100, saved: 5, log: []}); d.messages.push({id: uid(), text: x, by: 'A', at: Date.now()});
      d.contacts.push({id: uid(), name: x, phone: x, group: 'Family', note: x}); d.watch.push({id: uid(), title: x, type: 'Series', where: 'Netflix', status: ['want','watching','done'][i % 3], note: x, rating: 3}); d.activities.push({id: uid(), title: x, cat: 'Adventure', place: x, cost: 50, date: t, note: x, done: i % 2 === 0, rating: 4}); d.memories.push({id: uid(), title: x, date: t, likes: 0, by: 'A'}); act('✅', x); });
    d.cars.push({id: uid(), name: N[0], plate: N[1], mileage: 1000, mileageAt: t}); d.services.push({id: uid(), car: d.cars[0].id, date: t, km: 900, cost: 10, note: N[0]});
    d.meals[t] = {Breakfast: N[0], Lunch: N[1], Dinner: N[2]}; DB.save(); }, NASTY);
  const report = []; let clicks = 0;
  for (const [tab, pre] of VIEWS) {
    const go = async () => p.evaluate(([tab, pre]) => { closeSheet(); st.q = ''; eval(pre); st.tab = tab; render(); }, [tab, pre]);
    await go(); const ov = await p.evaluate(() => { const over = document.documentElement.scrollWidth - innerWidth; const wide = [...document.querySelectorAll('#app *')].filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && !el.closest('.chips,.otdrow,.pseg,svg,.cal'); }).slice(0, 2).map(el => el.tagName + '.' + el.className + ':' + (el.textContent || '').slice(0, 25)); return over > 0 || wide.length ? `OVERFLOW ${over}px ${wide.join(' | ')}` : ''; }); if (ov) report.push(`${tab} ${pre}: ${ov}`);
    const n = await p.evaluate(() => document.querySelectorAll('#app [onclick], #app [oninput], #app [onchange]').length);
    for (let i = 0; i < Math.min(n, 220); i++) {
      await go(); const before = errs.length;
      const label = await p.evaluate(i => { const el = document.querySelectorAll('#app [onclick], #app [oninput], #app [onchange]')[i]; if (!el) return null; const txt = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40);
        try { if (el.getAttribute('onclick')) el.click(); else el.dispatchEvent(new Event(el.getAttribute('oninput') ? 'input' : 'change', {bubbles: true})); } catch (e) { return txt + ' THROW ' + e.message; } return txt; }, i);
      clicks++; await p.waitForTimeout(5);
      // also click every button inside a sheet that opened (one level)
      const sn = await p.evaluate(() => document.querySelectorAll('#sheet [onclick]').length);
      for (let j = 0; j < Math.min(sn, 25); j++) { const b4 = errs.length; const sl = await p.evaluate(j => { const el = document.querySelectorAll('#sheet [onclick]')[j]; if (!el || /Delete|Remove/.test(el.textContent)) return null; const t = el.textContent.trim().slice(0, 30); el.click(); return t; }, j); clicks++;
        if (errs.length > b4) report.push(`${tab} ${pre} › "${label}" › sheet "${sl}": ${errs.slice(b4).join(' / ').slice(0, 220)}`);
        if (sl !== null) { await go(); await p.evaluate(i => { const el = document.querySelectorAll('#app [onclick]')[i]; el && el.click(); }, i); } }
      if (errs.length > before) report.push(`${tab} ${pre} › "${label}": ${errs.slice(before).join(' / ').slice(0, 220)}`);
    }
  }
  // check for raw HTML injection: any <script>/<b> rendered as element from data?
  const inj = await p.evaluate(() => { st.tab = 'home'; render(); return document.querySelectorAll('#app b').length; });
  console.log('clicks', clicks); console.log([...new Set(report)].join('\n') || 'HOSTILE OK');
  await b.close();
})();
