// Malaysia timezone, fixed clocks at tricky moments, hostile long text overflow
const { chromium } = require('playwright'); const { NASTY } = require('./common');
const URL = 'file:///mnt/project-files/family-app/index.html';
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const clock of ['2027-02-28T07:30:00+08:00', '2028-02-29T23:59:30+08:00', '2026-12-31T23:59:00+08:00', '2027-01-01T00:01:00+08:00', '2026-11-12T06:00:00+08:00']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Kuala_Lumpur' }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.clock.install({ time: new Date(clock) });
    await p.goto(URL); await p.evaluate(() => hideSplash && hideSplash());
    const r = await p.evaluate(() => { const res = {};
      res.today = todayISO();
      // anniversary on leap day
      S().startDate = '2024-02-29';
      const k = newKid({name: 'Leap', dob: '2024-02-29', sex: 'girl'}); D().kids.push(k); S().activeKid = k.id;
      res.otd = onThisDay().map(x => x.title);
      // vaccine due dates for dob on 31st
      k.dob = '2025-01-31'; res.vax2m = addMonths('2025-01-31', 1) + ' ' + addMonths('2025-01-31', 2);
      // monthly bill on the 31st in Feb
      D().bills.push({id: 'b31', name: 'Loan', type: 'Loan', amount: 100, dueDay: 31, payer: 'both', paid: []});
      res.bill = billDates(todayISO().slice(0, 8) + '01', todayISO().slice(0, 8) + '31').map(b => b.date);
      // scheduled roll
      D().scheduled.push({id: 's1', name: 'Ins', type: 'Insurance', amount: 1, next: '2026-01-31', freq: 'quarterly', payer: 'both', done: false}); paySched('s1'); res.roll = D().scheduled[0].next;
      // calendar next month across year
      st.tab = 'calendar'; render(); calMove(1); res.cal = st.calY + '-' + (st.calM + 1);
      // home renders + prayer card
      st.tab = 'home'; render(); res.pray = document.querySelector('.pray .pseg .on b')?.textContent || 'tomorrow/none';
      res.days = document.querySelector('.hero .big')?.textContent;
      // future dob
      k.dob = '2030-01-01'; st.tab = 'kids'; render(); res.future = document.querySelector('.sub')?.textContent;
      // meals week across year end
      st.tab = 'restock'; st.restockView = 'meals'; render(); res.meals = document.querySelectorAll('#app .card').length;
      return res; });
    out.push(clock + ' ' + JSON.stringify(r) + (errs.length ? ' ERR ' + errs.join(' | ') : ''));
    await ctx.close();
  }
  console.log(out.join('\n')); await b.close();
})();
