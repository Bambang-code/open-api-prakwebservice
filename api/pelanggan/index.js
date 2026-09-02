import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { kota } = req.query;
      const rows = kota
        ? await sql`SELECT * FROM pelanggan WHERE kota = ${kota} ORDER BY id`
        : await sql`SELECT * FROM pelanggan ORDER BY id`;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'POST') {
    const { nama, email, no_telepon, kota } = req.body ?? {};
    if (!nama) {
      return res.status(400).json({ code: 400, message: 'Field "nama" wajib diisi' });
    }
    try {
      const [row] = await sql`
        INSERT INTO pelanggan (nama, email, no_telepon, kota)
        VALUES (${nama}, ${email ?? null}, ${no_telepon ?? null}, ${kota ?? null})
        RETURNING *
      `;
      return res.status(201).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
