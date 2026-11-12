const NASTY = ["Adam's \"toy\"", "<b>bold</b> & <script>alert(1)</script>", "😀👨‍👩‍👧 Emoji", "a".repeat(300), "  ", "\\back\\slash\\", "it's 50% off ${x}", "Line1\nLine2", "ملك", "0", "-5", "1e9", "</div>", "' onclick='x"];
const URL = 'file:///mnt/project-files/family-app/index.html';
async function open(b, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: opts.w || 390, height: 844 }, colorScheme: opts.scheme || 'light' });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g|ERR_FILE|net::/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  p.on('dialog', d => { errs.push('DIALOG ' + d.message()); d.dismiss(); });
  await p.addInitScript(() => { window.open = () => null; });
  await p.goto(URL); await p.evaluate(() => hideSplash());
  return { ctx, p, errs };
}
module.exports = { NASTY, URL, open };
