import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [row] = await sql`
        SELECT id, pelanggan_id, produk_id, jumlah, tanggal, total::float8 AS total
        FROM penjualan WHERE id = ${id}
      `;
      if (!row) return res.status(404).json({ code: 404, message: 'Transaksi tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { pelanggan_id, produk_id, jumlah, tanggal, total } = req.body ?? {};
    if (!pelanggan_id || !produk_id || !jumlah) {
      return res.status(400).json({
        code: 400,
        message: 'Field "pelanggan_id", "produk_id", dan "jumlah" wajib diisi',
      });
    }
    try {
      const [row] = await sql`
        UPDATE penjualan
        SET pelanggan_id = ${pelanggan_id}, produk_id = ${produk_id}, jumlah = ${jumlah},
            tanggal = ${tanggal ?? new Date().toISOString().slice(0, 10)}, total = ${total ?? null}
        WHERE id = ${id}
        RETURNING id, pelanggan_id, produk_id, jumlah, tanggal, total::float8 AS total
      `;
      if (!row) return res.status(404).json({ code: 404, message: 'Transaksi tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [row] = await sql`DELETE FROM penjualan WHERE id = ${id} RETURNING id`;
      if (!row) return res.status(404).json({ code: 404, message: 'Transaksi tidak ditemukan' });
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
