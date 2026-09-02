import { sql } from '../../lib/db.js';
import { applyCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { kategori } = req.query;
      const rows = kategori
        ? await sql`SELECT id, nama_produk, kategori, harga::float8 AS harga, stok FROM produk WHERE kategori = ${kategori} ORDER BY id`
        : await sql`SELECT id, nama_produk, kategori, harga::float8 AS harga, stok FROM produk ORDER BY id`;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  if (req.method === 'POST') {
    const { nama_produk, kategori, harga, stok } = req.body ?? {};
    if (!nama_produk || harga === undefined) {
      return res.status(400).json({ code: 400, message: 'Field "nama_produk" dan "harga" wajib diisi' });
    }
    try {
      const [row] = await sql`
        INSERT INTO produk (nama_produk, kategori, harga, stok)
        VALUES (${nama_produk}, ${kategori ?? null}, ${harga}, ${stok ?? 0})
        RETURNING id, nama_produk, kategori, harga::float8 AS harga, stok
      `;
      return res.status(201).json(row);
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
}
