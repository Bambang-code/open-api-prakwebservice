import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('Environment variable DATABASE_URL belum diset.');
}

// Driver HTTP-based dari Neon — cocok untuk serverless functions
// karena tidak butuh koneksi TCP persisten seperti driver `pg` biasa.
export const sql = neon(process.env.DATABASE_URL);
