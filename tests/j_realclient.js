const { chromium } = require('playwright'); const { open } = require('./common');
(async () => { const b = await chromium.launch(); const { p, errs } = await open(b); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => ({enabled: SYNC.enabled(), ready: SYNC.ready, lib: typeof window.supabase?.createClient, status: SYNC.status})));
  await p.evaluate(() => { st.tab = 'more'; st.more = 'Settings'; render(); }); await p.waitForTimeout(300);
  console.log('form:', await p.evaluate(() => !!document.getElementById('se')));
  await p.fill('#se', 'test@example.com'); await p.fill('#spw', 'password123'); await p.click('button:has-text("Sign in")'); for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); const t = await p.evaluate(() => document.querySelector('.toast')?.textContent); if (t) { console.log('after', i * 0.5, 's'); break; } }
  console.log('toast:', await p.evaluate(() => [...document.querySelectorAll('.toast')].map(t=>t.textContent))); console.log('errors', errs); await b.close(); })();
