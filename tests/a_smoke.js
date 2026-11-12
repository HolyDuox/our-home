// every screen x themes x widths: page errors + horizontal overflow
const { chromium } = require('playwright'); const { open } = require('./common');
const VIEWS = [['home'], ['tasks'], ['restock', "st.restockView='list'"], ['restock', "st.restockView='meals'"], ['restock', "st.restockView='recipes'"], ['calendar', "st.planView='cal'"], ['calendar', "st.planView='watch';st.watchStat='want'"], ['calendar', "st.planView='watch';st.watchStat='watching'"], ['calendar', "st.planView='act';st.actStat='todo'"], ['calendar', "st.planView='act';st.actStat='done'"], ['calendar', "st.planView='karaoke';st.kFilter='all'"], ['calendar', "st.planView='karaoke';st.kFilter='fav'"],
  ...['Overview','Expenses','Bills','Savings goals','Wealth','Wishlist'].map(m => ['money', `st.money='${m}'`]), ['money', "st.money='Bills';st.commitView='scheduled'"],
  ...['Memories','Notes','Car','Contacts','Settings'].map(m => ['more', `st.more='${m}'`]),
  ...['Today','Growth','Vaccines','Milestones','School','Chores'].map(t => ['kids', `st.babyTab='${t}'`])];
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const scheme of ['light', 'dark']) for (const w of [320, 390, 430, 768]) for (const empty of [true, false]) {
    const { ctx, p, errs } = await open(b, { w, scheme });
    if (!empty) await p.evaluate(() => { D().kids.push(newKid({name: 'Aisyah', dob: '2025-11-01', sex: 'girl'}), newKid({name: 'Adam', dob: '2018-06-15', sex: 'boy'})); S().activeKid = D().kids[0].id; S().startDate = '2020-02-29'; DB.save(); });
    for (const [tab, pre] of VIEWS) {
      const r = await p.evaluate(([tab, pre]) => { try { if (pre) eval(pre); st.tab = tab; render(); } catch (e) { return 'THROW ' + e.message; }
        const over = document.documentElement.scrollWidth - innerWidth; const wide = [...document.querySelectorAll('#app *')].filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && !el.closest('.chips,.otdrow,.pseg,svg,.cal'); }).slice(0, 3).map(el => el.tagName + '.' + el.className + ':' + (el.textContent || '').slice(0, 30));
        return over > 0 || wide.length ? `overflow ${over}px ${wide.join(' | ')}` : ''; }, [tab, pre]);
      if (r) out.push(`${scheme} ${w} ${empty ? 'empty' : 'kids'} ${tab} ${pre || ''}: ${r}`);
    }
    if (errs.length) out.push(`${scheme} ${w} ${empty ? 'empty' : 'kids'} errors: ${[...new Set(errs)].join(' || ')}`);
    await ctx.close();
  }
  console.log(out.length ? out.join('\n') : 'SMOKE OK'); await b.close();
})();
