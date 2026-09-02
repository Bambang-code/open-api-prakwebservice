// Izinkan akses dari mana saja (mis. Swagger UI "Try it out" di browser).
// Mengembalikan true jika request adalah preflight OPTIONS dan sudah dijawab.
export function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
