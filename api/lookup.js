import { cmd } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { code = '', firstName = '', lastName = '' } = req.body || {};
    const key = 'res:' + String(code).toUpperCase().trim();
    const raw = await cmd('GET', key);
    const r = raw && JSON.parse(raw);
    const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    if (!r || !same(r.lastName, lastName) || !same(r.firstName, firstName)) {
      return res.status(404).json({ error: "We couldn't find a reservation matching those details." });
    }
    const { email, ...safe } = r; // never expose email publicly
    res.json(safe);
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
