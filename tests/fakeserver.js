// in-memory stand-in for Supabase (tables + auth + storage), mirrors the rules in supabase-setup.sql
const http = require('http');
function start(port) {
  const users = {}, sessions = {}, households = {}, members = [], items = new Map(), photos = {}; let clock = Date.now(), offline = new Set();
  const now = () => { clock = Math.max(clock + 1, Date.now()); return new Date(clock).toISOString(); };
  const isMember = (uid, hh) => members.some(m => m.hh === hh && m.uid === uid);
  const srv = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*'); if (req.method === 'OPTIONS') return res.end();
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      const send = (code, obj) => { res.writeHead(code, {'Content-Type': 'application/json'}); res.end(JSON.stringify(obj)); };
      const tok = req.headers['x-token'], uid = sessions[tok], j = body ? JSON.parse(body) : {}, path = req.url.split('?')[0];
      if (offline.has(req.headers['x-phone'])) { res.destroy(); return; }
      if (path === '/signup') { if (users[j.email]) return send(400, {error: 'User already registered'}); const id = 'u' + Object.keys(users).length; users[j.email] = {id, pw: j.pw}; const t = 't' + Math.random(); sessions[t] = id; return send(200, {token: t, user: {id, email: j.email}}); }
      if (path === '/signin') { const u = users[j.email]; if (!u || u.pw !== j.pw) return send(400, {error: 'Invalid login credentials'}); const t = 't' + Math.random(); sessions[t] = u.id; return send(200, {token: t, user: {id: u.id, email: j.email}}); }
      if (path === '/_offline') { j.off ? offline.add(j.phone) : offline.delete(j.phone); return send(200, {}); }
      if (path === '/_stats') return send(200, {items: items.size, photos: Object.keys(photos).length, members: members.length, live: [...items.values()].filter(r => !r.deleted).length});
      if (!uid) return send(401, {error: 'not signed in'});
      if (path === '/myhh') return send(200, Object.values(households).filter(h => isMember(uid, h.id)));
      if (path === '/create') { const id = 'h' + Object.keys(households).length, code = Math.random().toString(36).slice(2, 8).toUpperCase(); households[id] = {id, code, name: j.name}; members.push({hh: id, uid}); return send(200, [households[id]]); }
      if (path === '/join') { const h = Object.values(households).find(h => h.code === j.code); if (!h) return send(400, {error: 'No household with that code'}); if (!isMember(uid, h.id)) members.push({hh: h.id, uid}); return send(200, [h]); }
      if (path === '/pull') { if (!isMember(uid, j.hh)) return send(403, {error: 'not a member'}); return send(200, [...items.values()].filter(r => r.hh === j.hh && r.updated_at > j.since).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1).map(({hh, ...r}) => r)); }
      if (path === '/push') { if (!isMember(uid, j.hh)) return send(403, {error: 'not a member'}); for (const r of j.rows) items.set(j.hh + '|' + r.coll + '|' + r.id, {...r, hh: j.hh, updated_at: now()}); return send(200, {}); }
      if (path === '/putimg') { if (!isMember(uid, j.hh)) return send(403, {}); photos[j.hh + '/' + j.id] = j.src; return send(200, {}); }
      if (path === '/getimg') { if (!isMember(uid, j.hh)) return send(403, {}); return send(200, {src: photos[j.hh + '/' + j.id] || null}); }
      send(404, {error: 'no route'});
    });
  });
  srv.listen(port); return srv;
}
// browser-side adapter with the same shape as supabaseApi()
const CLIENT = (port, phone) => `window.__SYNC_API = (() => { const B = 'http://127.0.0.1:${port}'; let tok = localStorage.getItem('fake.tok'), me = JSON.parse(localStorage.getItem('fake.user') || 'null');
  const call = async (p, b) => { const r = await fetch(B + p, {method: 'POST', headers: {'Content-Type': 'application/json', 'x-token': tok || '', 'x-phone': '${phone}'}, body: JSON.stringify(b || {})}); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'error'); return j; };
  const keep = j => { tok = j.token; me = j.user; localStorage.setItem('fake.tok', tok); localStorage.setItem('fake.user', JSON.stringify(me)); return me; };
  let subs = []; setInterval(() => subs.forEach(f => f()), 700);
  return { async user() { return me; }, onAuth() {}, async signUp(e, p) { return keep(await call('/signup', {email: e, pw: p})); }, async signIn(e, p) { return keep(await call('/signin', {email: e, pw: p})); },
    async resetPw() {}, async signOut() { tok = null; me = null; localStorage.removeItem('fake.tok'); localStorage.removeItem('fake.user'); },
    myHouseholds: () => call('/myhh'), createHousehold: n => call('/create', {name: n}), joinHousehold: c => call('/join', {code: c}),
    pull: (hh, since) => call('/pull', {hh, since}), push: (hh, rows) => call('/push', {hh, rows}),
    subscribe(hh, cb) { subs.push(cb); return () => { subs = subs.filter(f => f !== cb); }; },
    putImg: (hh, id, src) => call('/putimg', {hh, id, src}), async getImg(hh, id) { return (await call('/getimg', {hh, id})).src; } }; })();`;
module.exports = { start, CLIENT };
