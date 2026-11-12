const { chromium } = require('playwright'); const { open } = require('./common');
(async () => {
  const b = await chromium.launch(); const { p, errs } = await open(b);
  const seeded = await p.evaluate(async () => {
    const R = n => Math.floor(Math.random() * n), day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }, pick = a => a[R(a.length)];
    const d = D(); S().startDate = '2019-03-10'; S().nameA = 'Shaz'; S().nameB = 'Wife';
    ['Aisyah:2025-11-01:girl', 'Adam:2018-06-15:boy', 'Hana:2021-02-28:girl'].forEach(x => { const [n, dob, sex] = x.split(':'); d.kids.push(newKid({name: n, dob, sex})); });
    for (const k of d.kids) { for (let i = 0; i < 60; i++) k.growth.push({id: uid(), date: day(i * 15), weight: (10 + Math.random() * 20).toFixed(1), height: (70 + Math.random() * 60).toFixed(0)});
      Object.keys(MS_RANGE).slice(0, 30).forEach(m => k.milestones[m] = day(R(900)));
      k.classes = Array.from({length: 6}, (_, i) => ({id: uid(), title: 'Class ' + i, days: [R(7)], time: '15:00', place: 'Centre'}));
      k.dates = Array.from({length: 80}, (_, i) => ({id: uid(), title: 'Exam ' + i, date: day(R(1000) - 300), type: 'Exam'}));
      k.chores = Array.from({length: 10}, (_, i) => ({id: uid(), title: 'Chore ' + i, reward: 1, repeat: 'daily'}));
      k.choreLog = Array.from({length: 3000}, (_, i) => ({id: uid(), chore: k.chores[R(10)].id, title: 'Chore', reward: 1, date: day(R(1000))}));
      k.payouts = Array.from({length: 150}, () => ({id: uid(), amount: 5, date: day(R(1000)), note: 'Weekly'})); }
    S().activeKid = d.kids[0].id;
    d.kids[0].babylog = Array.from({length: 16000}, () => ({id: uid(), at: Date.now() - R(1000) * 864e5, by: 'A', type: pick(['feed', 'diaper', 'sleep']), sub: 'Bottle 120 ml', ml: 120}));
    d.tasks = Array.from({length: 3000}, (_, i) => ({id: uid(), title: 'Task number ' + i, due: day(R(1000) - 30), done: Math.random() < .9, by: 'A', who: 'both'}));
    d.restock = Array.from({length: 800}, (_, i) => ({id: uid(), name: 'Item ' + i, cat: pick(d.restockCats), links: [], by: 'A', done: Math.random() < .7}));
    d.events = Array.from({length: 600}, (_, i) => ({id: uid(), title: 'Event ' + i, date: day(R(1100) - 100), by: 'A'}));
    d.bills = Array.from({length: 25}, (_, i) => ({id: uid(), name: 'Bill ' + i, type: pick(CTYPES)[0], amount: 100 + R(900), dueDay: 1 + R(31), payer: 'both', paid: [], paidOn: {}}));
    d.scheduled = Array.from({length: 30}, (_, i) => ({id: uid(), name: 'Sched ' + i, type: 'Insurance', amount: 500, next: day(-R(300)), freq: 'yearly', payer: 'both', done: false}));
    d.expenses = Array.from({length: 9000}, (_, i) => ({id: uid(), amount: +(5 + Math.random() * 200).toFixed(2), date: day(R(1100)), cat: pick(ECATS)[0], who: pick(['A', 'B']), note: 'Lunch at somewhere'}));
    d.notes = Array.from({length: 300}, (_, i) => ({id: uid(), title: 'Note ' + i, body: 'Lorem ipsum dolor sit amet '.repeat(20), pin: i < 5, updated: Date.now() - R(1e10), by: 'A', photos: []}));
    d.recipes = Array.from({length: 150}, (_, i) => ({id: uid(), name: 'Recipe ' + i, section: pick(['General', 'Baby']), ingredients: ['Rice', 'Egg', 'Onion', 'Garlic'], steps: 'Cook it well. '.repeat(10), by: 'A'}));
    d.wishes = Array.from({length: 200}, (_, i) => ({id: uid(), name: 'Wish ' + i, price: R(3000), cat: 'Home', by: 'A'}));
    d.goals = Array.from({length: 15}, (_, i) => ({id: uid(), name: 'Goal ' + i, target: 10000, saved: R(10000), log: Array.from({length: 100}, () => ({amt: 100, at: Date.now() - R(1e10)}))}));
    d.messages = Array.from({length: 3000}, (_, i) => ({id: uid(), text: 'Love you, dont forget the milk ' + i, by: pick(['A', 'B']), at: Date.now() - R(1e11)}));
    d.contacts = Array.from({length: 300}, (_, i) => ({id: uid(), name: 'Contact ' + i, phone: '0123456' + i, group: pick(CGROUPS)[0], star: i < 10}));
    d.cars = [{id: uid(), name: 'Myvi', plate: 'WXX 1234', mileage: 80000, mileageAt: day(10), serviceKm: 10000, serviceMonths: 6}];
    d.services = Array.from({length: 40}, (_, i) => ({id: uid(), car: d.cars[0].id, date: day(i * 30), km: 80000 - i * 2000, cost: 300, note: 'Service'}));
    for (let i = 0; i < 400; i++) d.memories.push({id: uid(), title: 'Memory ' + i, date: day(R(1500)), likes: R(3), by: 'A'});
    for (let i = 0; i < 400; i++) act('✅', 'did thing ' + i);
    for (let w = -150; w < 4; w++) { const ws = weekStart(w); for (let k = 0; k < 7; k++) { const dd = new Date(ws); dd.setDate(dd.getDate() + k); d.meals[isoOf(dd)] = {Breakfast: 'Roti canai', Dinner: 'Nasi lemak'}; } }
    const t0 = performance.now(); DB.save(); const saveMs = performance.now() - t0;
    return {chars: localStorage.getItem('ourhome.v1').length, saveMs: Math.round(saveMs)};
  });
  console.log('seeded', JSON.stringify(seeded));
  // photos in IndexedDB: 400 x ~150KB
  const imgMs = await p.evaluate(async () => { const c = document.createElement('canvas'); c.width = 900; c.height = 900; const g = c.getContext('2d');
    for (let i = 0; i < 900; i += 30) { g.fillStyle = `hsl(${i},70%,60%)`; g.fillRect(i, 0, 30, 900); for (let j = 0; j < 900; j += 7) { g.fillStyle = `rgba(0,0,0,${Math.random() * .3})`; g.fillRect(i, j, 30, 7); } }
    const src = c.toDataURL('image/jpeg', .8); const t0 = performance.now(); for (const m of D().memories) await IMG.put(m.id, src); return [Math.round(performance.now() - t0), Math.round(src.length / 1024)]; });
  console.log('400 photos stored (ms, KB each):', imgMs);
  const VIEWS = [['home'], ['tasks'], ['restock', "st.restockView='list'"], ['restock', "st.restockView='meals'"], ['restock', "st.restockView='recipes'"], ['calendar'],
    ...['Overview','Expenses','Bills','Savings goals','Wishlist'].map(m => ['money', `st.money='${m}'`]),
    ...['Memories','Notes','Car','Contacts','Settings'].map(m => ['more', `st.more='${m}'`]),
    ...['Today','Growth','Vaccines','Milestones','School','Chores'].map(t => ['kids', `st.babyTab='${t}'`])];
  const times = [];
  for (const [tab, pre] of VIEWS) { const ms = await p.evaluate(([tab, pre]) => { if (pre) eval(pre); st.tab = tab; const t0 = performance.now(); render(); return Math.round(performance.now() - t0); }, [tab, pre]); times.push(`${tab}${pre ? ' ' + pre.split("'")[1] : ''}: ${ms}ms`); }
  console.log('render times:\n  ' + times.join('\n  '));
  // search
  console.log('search ms', await p.evaluate(() => { st.tab = 'home'; st.q = 'item 1'; const t0 = performance.now(); render(); const ms = performance.now() - t0; st.q = ''; return Math.round(ms); }));
  // typical action: tick a task -> save + render
  console.log('tick task ms', await p.evaluate(() => { st.tab = 'tasks'; render(); const t0 = performance.now(); const x = D().tasks.find(t => !t.done); x.done = true; DB.save(); render(); return Math.round(performance.now() - t0); }));
  // reload with heavy data
  const t0 = Date.now(); await p.reload(); await p.evaluate(() => hideSplash()); console.log('reload ms', Date.now() - t0);
  // memories page photo hydration
  await p.evaluate(() => { st.tab = 'more'; st.more = 'Memories'; render(); }); await p.waitForTimeout(1500);
  console.log('mem imgs hydrated', await p.evaluate(() => document.querySelectorAll('[data-img][data-done]').length), 'of', await p.evaluate(() => document.querySelectorAll('[data-img]').length));
  // how far until storage full?
  const full = await p.evaluate(() => { let n = 0; try { for (;;) { D().expenses.push(...Array.from({length: 2000}, () => ({id: uid(), amount: 12.5, date: '2026-01-01', cat: 'Food', who: 'A', note: 'Lunch at somewhere'}))); n += 2000; localStorage.setItem('ourhome.v1', JSON.stringify(D())); if (n > 400000) break; } } catch (e) { return {extraExpensesBeforeFull: n, chars: JSON.stringify(D()).length, err: e.name}; } return {noLimitHit: n}; });
  console.log('storage limit', JSON.stringify(full));
  console.log('errors:', [...new Set(errs)]); await b.close();
})();
