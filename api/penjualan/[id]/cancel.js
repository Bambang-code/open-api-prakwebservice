import { sql } from "../../../lib/db.js";
import { applyCors } from "../../../lib/cors.js";
import { penjualanLinks } from "../../../lib/links.js";

// POST /api/penjualan/:id/cancel
// Transisi status: pending | disetujui -> dibatalkan
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res
      .status(405)
      .json({ code: 405, message: `Method ${req.method} tidak diizinkan` });
  }

  const { id } = req.query;
  try {
    const [existing] = await sql`SELECT id, status FROM penjualan WHERE id = ${id}`;
    if (!existing) {
      return res.status(404).json({ code: 404, message: "Transaksi tidak ditemukan" });
    }
    if (existing.status !== "pending" && existing.status !== "disetujui") {
      return res.status(409).json({
        code: 409,
        message: `Transaksi berstatus "${existing.status}" tidak bisa dibatalkan`,
      });
    }

    const [row] = await sql`
      UPDATE penjualan SET status = 'dibatalkan' WHERE id = ${id}
      RETURNING id, pelanggan_id, produk_id, jumlah, tanggal, total::float8 AS total, status
    `;
    return res.status(200).json({ ...row, links: penjualanLinks(req, row) });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message });
  }
}
