# Auth Starter (Next.js + Prisma + Auth.js + reCAPTCHA v3)

Aplikasi autentikasi sederhana yang menyediakan halaman Login, Register, dan Profile dengan integrasi Prisma (SQLite), Auth.js (credentials), dan Google reCAPTCHA v3.

## Fitur

- Login dengan email + password (terproteksi reCAPTCHA v3)
- Registrasi user baru dengan validasi Zod
- Halaman profil untuk melihat dan mengubah data (name, bio, location, website)
- Session dengan JWT via Auth.js
- UI minimalis menggunakan Tailwind CSS dan shadcn/ui

## Prasyarat

- Node.js LTS
- Dependensi terpasang: `npm install`

## Setup Lingkungan

1. Salin `.env.example` menjadi `.env`
2. Isi variabel berikut:
   - `NEXTAUTH_URL="http://localhost:3000"`
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `DATABASE_URL="file:./db/custom.db"` (default yang digunakan)
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (dari Google Console)
   - `RECAPTCHA_SECRET_KEY` (dari Google Console)
   - `RECAPTCHA_MIN_SCORE="0.5"`

## Database (Prisma)

```bash
npm run db:generate
npm run db:push
```

Model `User` terdapat pada `prisma/schema.prisma` dan sudah mencakup field dasar seperti `email`, `username`, `password`, `name`, `bio`, dll.

## Menjalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Routing

- `/` → Login
- `/register` → Registrasi
- `/profile` → Profil

## Catatan Keamanan

- Pastikan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` dan `RECAPTCHA_SECRET_KEY` diisi dengan benar.
- Password di-hash menggunakan `bcryptjs`.
- reCAPTCHA diverifikasi di server menggunakan endpoint Google.

## Struktur Proyek Singkat

```
src/
├── app/           # Halaman (App Router)
├── components/    # Komponen UI
├── hooks/         # Hooks (mis. use-recaptcha, use-auth)
└── lib/           # Layanan (auth, db, recaptcha, validasi)
```

## Lisensi

Proyek ini ditujukan sebagai starter untuk kebutuhan autentikasi sederhana. Gunakan dan modifikasi sesuai kebutuhan.
