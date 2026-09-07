-- =========================================
-- Migration: tambah kolom status di tabel penjualan
-- Dibutuhkan supaya endpoint /api/penjualan bisa naik ke RMM Level 3
-- (transaksi punya state: pending -> disetujui -> dikirim, atau dibatalkan)
-- =========================================

ALTER TABLE penjualan
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Nilai yang valid untuk status:
--   'pending'     -> baru dibuat, menunggu disetujui
--   'disetujui'   -> sudah di-approve, siap dikirim
--   'dikirim'     -> sudah selesai / dikirim ke pelanggan
--   'dibatalkan'  -> transaksi dibatalkan

-- Jalankan sekali saja di Neon (SQL editor / neon console) sebelum deploy ulang.
-- Data lama otomatis terisi status = 'pending' karena ada DEFAULT.
