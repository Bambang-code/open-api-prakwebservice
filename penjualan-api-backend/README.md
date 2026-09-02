# Penjualan API — Backend (Vercel + Neon)

Implementasi backend dari `openapi.yaml`, siap deploy ke Vercel dan terhubung ke
database Neon (skema `pelanggan`, `produk`, `penjualan` dari lab 01).

## Struktur

```
api/
  pelanggan/index.js     -> GET (list), POST     /api/pelanggan
  pelanggan/[id].js      -> GET, PUT, DELETE      /api/pelanggan/:id
  produk/index.js        -> GET (list), POST      /api/produk
  produk/[id].js         -> GET, PUT, DELETE      /api/produk/:id
  penjualan/index.js     -> GET (list), POST      /api/penjualan
  penjualan/[id].js      -> GET, PUT, DELETE      /api/penjualan/:id
lib/
  db.js                  -> koneksi Neon (@neondatabase/serverless)
  cors.js                -> header CORS + handle preflight OPTIONS
schema.sql                -> skema tabel (referensi, tabelnya sudah ada di Neon)
openapi.yaml               -> kontrak API (dari lab 03)
```

Vercel otomatis mengenali setiap file di dalam `api/` sebagai satu serverless
function — tidak perlu setup Express atau router manual.

## Langkah Deploy

### 1. Siapkan project
```bash
cd penjualan-api-backend
npm install
```

### 2. Push ke GitHub
Buat repo baru, lalu:
```bash
git init
git add .
git commit -m "Backend penjualan API"
git branch -M main
git remote add origin <url-repo-kamu>
git push -u origin main
```

### 3. Import ke Vercel
1. Buka [vercel.com](https://vercel.com) -> **Add New Project** -> pilih repo GitHub ini.
2. Di step **Environment Variables**, tambahkan:
   - `DATABASE_URL` = connection string dari Neon (Neon dashboard -> Connect -> pilih **Pooled connection**)
3. Klik **Deploy**.

> Tips: Vercel punya integrasi native ke Neon (Storage tab -> Connect Database)
> yang otomatis mengisikan `DATABASE_URL` untukmu, tanpa copy-paste manual.

### 4. Test endpoint
Setelah deploy selesai, kamu dapat URL seperti `https://penjualan-api-xxxx.vercel.app`.
Coba:
```bash
curl https://penjualan-api-xxxx.vercel.app/api/pelanggan
curl https://penjualan-api-xxxx.vercel.app/api/produk?kategori=Minuman
```

### 5. Update openapi.yaml
Ganti URL di bagian `servers:` pada `openapi.yaml` dengan URL Vercel asli kamu,
lalu re-validasi di editor.swagger.io.

## Development lokal (opsional)
```bash
npm install -g vercel
cp .env.example .env   # isi DATABASE_URL punyamu
vercel dev
```

## Catatan implementasi
- Endpoint `POST /api/penjualan` otomatis menghitung `total` (harga produk x jumlah)
  kalau field `total` tidak dikirim, dan memvalidasi `pelanggan_id`/`produk_id` benar-benar ada.
- Kolom `NUMERIC` (harga, total) di-cast ke `float8` saat query supaya balikan JSON-nya
  berupa number, sesuai tipe di `openapi.yaml` — bukan string.
- Response error konsisten: `{ "code": ..., "message": "..." }`.
