const { chromium } = require('playwright'); const { open, NASTY } = require('./common');
const STEPS = +process.argv[2] || 3000, SEED = +process.argv[3] || 1;
(async () => {
  const b = await chromium.launch(); const { p, errs } = await open(b, { w: 390 });
  await p.evaluate(() => { D().kids.push(newKid({name: 'Aisyah', dob: '2025-11-01', sex: 'girl'}), newKid({name: 'Adam', dob: '2018-06-15', sex: 'boy'})); S().activeKid = D().kids[0].id; DB.save(); render(); });
  const kinds = {};
  await p.evaluate(s => { let x = s; Math.random = () => (x = (x * 16807) % 2147483647) / 2147483647; }, SEED * 7919);
  const log = []; const t0 = Date.now();
  for (let i = 0; i < STEPS; i++) {
    const before = errs.length;
    const a = await p.evaluate(N => {
      const R = n => Math.floor(Math.random() * n);
      const sheetOpen = document.querySelector('#sheet .sheet');
      const scope = sheetOpen && Math.random() < .8 ? '#sheet' : (Math.random() < .12 ? '#nav' : '#app');
      // fill inputs sometimes
      if (Math.random() < .35) { const ins = [...document.querySelectorAll(scope + ' input:not([type=file]):not([type=checkbox]), ' + scope + ' textarea, ' + scope + ' select')]; if (ins.length) { const el = ins[R(ins.length)];
        if (el.tagName === 'SELECT') { el.selectedIndex = R(el.options.length); el.dispatchEvent(new Event('change', {bubbles: true})); return 'select ' + el.id; }
        const ty = el.type; el.value = ty === 'date' ? `20${20 + R(10)}-${String(1 + R(12)).padStart(2, '0')}-${String(1 + R(28)).padStart(2, '0')}` : ty === 'time' ? `${String(R(24)).padStart(2, '0')}:${R(2) ? '30' : '00'}` : (el.inputMode === 'decimal' || el.inputMode === 'numeric' || ty === 'number') ? [String(R(500)), '-3', '0', 'abc', '1e6', ''][R(6)] : N[R(N.length)];
        el.dispatchEvent(new Event('input', {bubbles: true})); return 'fill ' + (el.id || el.placeholder) + '=' + el.value.slice(0, 20); } }
      const els = [...document.querySelectorAll(scope + ' [onclick], ' + scope + ' button, ' + scope + ' label.btn')].filter(e => !e.closest('a[href]') && e.offsetParent !== null);
      if (!els.length) { if (sheetOpen) { closeSheet(); return 'close'; } return 'none'; }
      const el = els[R(els.length)]; const txt = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (/Backup|Restore|Reset everything|Erase|Delete all/i.test(txt)) return 'skip ' + txt;
      el.click(); return 'click [' + scope + '] ' + txt;
    }, NASTY).catch(e => 'EVALFAIL ' + e.message.slice(0, 100));
    log.push(a); if (log.length > 12) log.shift(); const kk = (a || '').split(' ')[0]; kinds[kk] = (kinds[kk] || 0) + 1;
    if (errs.length > before) { console.log(`step ${i}: ${errs.slice(before).join(' | ').slice(0, 300)}\n   last actions: ${log.slice(-6).join(' → ')}`); }
    if (i % 400 === 399) await p.evaluate(() => { closeSheet(); });
  }
  const integrity = await p.evaluate(async () => { try { const raw = await IMG.get('__data__'); const d = JSON.parse(raw); return {ok: true, tasks: d.tasks.length, exp: d.expenses.length, kids: d.kids.length, events: d.events.length, notes: d.notes.length}; } catch (e) { return {ok: false, e: e.message}; } });
  await p.reload(); await p.evaluate(() => hideSplash()); await p.waitForTimeout(500);
  const afterReload = await p.evaluate(() => { try { for (const t of ['home','tasks','restock','kids','calendar','money','more']) { st.tab = t; render(); } return 'renders ok'; } catch (e) { return 'RENDER FAIL ' + e.message; } });
  console.log(JSON.stringify(kinds));
  console.log(`seed ${SEED}: ${STEPS} steps in ${Math.round((Date.now() - t0) / 1000)}s, errors ${errs.length}, data ${JSON.stringify(integrity)}, after reload: ${afterReload}`);
  await b.close();
})();
