import { sql } from "../../../lib/db.js";
import { applyCors } from "../../../lib/cors.js";
import { produkLinks } from "../../../lib/links.js";

// POST /api/produk/:id/restock
// Body: { "tambah": 20 }  -> menambah stok produk sebanyak N
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res
      .status(405)
      .json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
  }

  const { id } = req.query;
  const { tambah } = req.body ?? {};
  if (!tambah || tambah <= 0) {
    return res.status(400).json({
      code: 400,
      message: 'Field "tambah" wajib diisi dengan angka > 0',
    });
  }

  try {
    const [existing] = await sql`SELECT id, stok FROM produk WHERE id = ${id}`;
    if (!existing) {
      return res.status(404).json({ code: 404, message: "Produk tidak ditemukan" });
    }

    const [row] = await sql`
      UPDATE produk SET stok = stok + ${tambah} WHERE id = ${id}
      RETURNING id, nama_produk, kategori, harga::float8 AS harga, stok
    `;
    return res.status(200).json({ ...row, links: produkLinks(req, row) });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
}
