import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [row] = await sql`SELECT id, nama_produk, kategori, harga::float8 AS harga, stok FROM produk WHERE id = ${id}`;
      if (!row) return res.status(404).json({ code: 404, message: 'Produk tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { nama_produk, kategori, harga, stok } = req.body ?? {};
    if (!nama_produk || harga === undefined) {
      return res.status(400).json({ code: 400, message: 'Field "nama_produk" dan "harga" wajib diisi' });
    }
    try {
      const [row] = await sql`
        UPDATE produk
        SET nama_produk = ${nama_produk}, kategori = ${kategori ?? null}, harga = ${harga}, stok = ${stok ?? 0}
        WHERE id = ${id}
        RETURNING id, nama_produk, kategori, harga::float8 AS harga, stok
      `;
      if (!row) return res.status(404).json({ code: 404, message: 'Produk tidak ditemukan' });
      return res.status(200).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [row] = await sql`DELETE FROM produk WHERE id = ${id} RETURNING id`;
      if (!row) return res.status(404).json({ code: 404, message: 'Produk tidak ditemukan' });
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
