// Helper kecil untuk membangun response HATEOAS (Level 3 RMM).
// Semua href dibuat absolut (pakai host dari request) supaya berfungsi
// sama baik di local dev (localhost:3000) maupun di Vercel.

export function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

// Link ke dokumentasi OpenAPI (file openapi.yaml di-serve statis oleh Vercel
// dari root project). rel "swagger" dipakai supaya klien / dosen bisa
// langsung tahu ke mana harus melihat kontrak lengkap API ini.
export function swaggerLink(req) {
  return {
    rel: 'swagger',
    href: `${baseUrl(req)}/openapi.yaml`,
    method: 'GET',
  };
}

// HATEOAS links untuk satu baris transaksi (penjualan), tergantung status-nya.
// Ini inti dari RMM Level 3: klien tahu aksi apa saja yang valid saat ini
// cukup dari response, tanpa perlu menghafal aturan transisi status di luar.
export function penjualanLinks(req, row) {
  const base = `/api/penjualan/${row.id}`;
  const links = [
    { rel: 'self', href: base, method: 'GET' },
    { rel: 'pelanggan', href: `/api/pelanggan/${row.pelanggan_id}`, method: 'GET' },
    { rel: 'produk', href: `/api/produk/${row.produk_id}`, method: 'GET' },
  ];

  if (row.status === 'pending') {
    links.push({ rel: 'approve', href: `${base}/approve`, method: 'POST' });
  }
  if (row.status === 'pending' || row.status === 'disetujui') {
    links.push({ rel: 'cancel', href: `${base}/cancel`, method: 'POST' });
  }
  if (row.status === 'disetujui') {
    links.push({ rel: 'kirim', href: `${base}/kirim`, method: 'POST' });
  }

  links.push(swaggerLink(req));
  return links;
}

// HATEOAS links untuk satu baris produk, tergantung stok-nya.
export function produkLinks(req, row) {
  const base = `/api/produk/${row.id}`;
  const links = [{ rel: 'self', href: base, method: 'GET' }];

  if (row.stok > 0) {
    links.push({ rel: 'beli', href: '/api/penjualan', method: 'POST' });
  } else {
    links.push({ rel: 'restock', href: `${base}/restock`, method: 'POST' });
  }

  links.push(swaggerLink(req));
  return links;
}
