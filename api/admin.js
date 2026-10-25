import { cmd } from './_db.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const gen = () => Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

export default async function handler(req, res) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || req.headers['x-admin-key'] !== pw) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (req.method === 'GET') {
      const codes = await cmd('SMEMBERS', 'res:index');
      if (!codes.length) return res.json([]);
      const vals = await cmd('MGET', ...codes.map((c) => 'res:' + c));
      return res.json(vals.filter(Boolean).map(JSON.parse).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (!b.firstName || !b.lastName) return res.status(400).json({ error: 'First and last name are required' });
      const code = (b.code || gen()).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (code.length < 5) return res.status(400).json({ error: 'Code must be 5-6 letters/numbers' });
      const segments = (b.segments || []).filter((s) => s.flight && s.from && s.to).map((s) => ({
        flight: String(s.flight), from: String(s.from).toUpperCase(), to: String(s.to).toUpperCase(),
        departs: String(s.departs || ''), arrives: String(s.arrives || ''),
        gate: String(s.gate || ''), seat: String(s.seat || ''),
      }));
      const rec = {
        code, firstName: String(b.firstName), lastName: String(b.lastName), email: String(b.email || ''),
        status: String(b.status || 'Confirmed'), segments, createdAt: b.createdAt || Date.now(),
      };
      await cmd('SET', 'res:' + code, JSON.stringify(rec));
      await cmd('SADD', 'res:index', code);
      return res.json(rec);
    }
    if (req.method === 'DELETE') {
      const code = String(req.query.code || '').toUpperCase();
      await cmd('DEL', 'res:' + code);
      await cmd('SREM', 'res:index', code);
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
