import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [row] = await sql`SELECT * FROM pelanggan WHERE id = ${id}`;
      if (!row) return res.status(404).json({ code: 404, message: 'Pelanggan tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { nama, email, no_telepon, kota } = req.body ?? {};
    if (!nama) {
      return res.status(400).json({ code: 400, message: 'Field "nama" wajib diisi' });
    }
    try {
      const [row] = await sql`
        UPDATE pelanggan
        SET nama = ${nama}, email = ${email ?? null}, no_telepon = ${no_telepon ?? null}, kota = ${kota ?? null}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!row) return res.status(404).json({ code: 404, message: 'Pelanggan tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [row] = await sql`DELETE FROM pelanggan WHERE id = ${id} RETURNING id`;
      if (!row) return res.status(404).json({ code: 404, message: 'Pelanggan tidak ditemukan' });
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
