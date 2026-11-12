const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => { const t0 = Date.now(); try { await Promise.race([SYNC.api.signIn('x@example.com', 'password123'), new Promise((_, j) => setTimeout(() => j(new Error('still pending after 25s')), 25000))]); return 'ok'; } catch (e) { return e.message + ' after ' + (Date.now() - t0) + 'ms'; } });
  console.log(r, errs); await b.close(); })();
