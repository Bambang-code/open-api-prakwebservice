import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { pelanggan_id, produk_id, tanggal_mulai, tanggal_akhir } = req.query;
      let rows = await sql`
        SELECT id, pelanggan_id, produk_id, jumlah, tanggal, total::float8 AS total
        FROM penjualan
        WHERE (${pelanggan_id ?? null}::int IS NULL OR pelanggan_id = ${pelanggan_id ?? null}::int)
          AND (${produk_id ?? null}::int IS NULL OR produk_id = ${produk_id ?? null}::int)
          AND (${tanggal_mulai ?? null}::date IS NULL OR tanggal >= ${tanggal_mulai ?? null}::date)
          AND (${tanggal_akhir ?? null}::date IS NULL OR tanggal <= ${tanggal_akhir ?? null}::date)
        ORDER BY id
      `;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'POST') {
    const { pelanggan_id, produk_id, jumlah, tanggal, total } = req.body ?? {};
    if (!pelanggan_id || !produk_id || !jumlah) {
      return res.status(400).json({
        code: 400,
        message: 'Field "pelanggan_id", "produk_id", dan "jumlah" wajib diisi',
      });
    }
    try {
      const [pelanggan] = await sql`SELECT id FROM pelanggan WHERE id = ${pelanggan_id}`;
      if (!pelanggan) {
        return res.status(404).json({ code: 404, message: 'pelanggan_id tidak ditemukan' });
      }
      const [produk] = await sql`SELECT id, harga::float8 AS harga FROM produk WHERE id = ${produk_id}`;
      if (!produk) {
        return res.status(404).json({ code: 404, message: 'produk_id tidak ditemukan' });
      }

      // Kalau "total" tidak dikirim, hitung otomatis dari harga produk x jumlah.
      const totalAkhir = total ?? produk.harga * jumlah;

      const [row] = await sql`
        INSERT INTO penjualan (pelanggan_id, produk_id, jumlah, tanggal, total)
        VALUES (
          ${pelanggan_id},
          ${produk_id},
          ${jumlah},
          ${tanggal ?? new Date().toISOString().slice(0, 10)},
          ${totalAkhir}
        )
        RETURNING id, pelanggan_id, produk_id, jumlah, tanggal, total::float8 AS total
      `;
      return res.status(201).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
