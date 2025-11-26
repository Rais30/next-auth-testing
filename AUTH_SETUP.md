# Authentication System Setup

Sistem autentikasi sederhana dengan NextAuth.js, Prisma, dan Google reCAPTCHA v3.

## Fitur

- ✅ Login dengan email dan password
- ✅ Registrasi user baru
- ✅ Profile management
- ✅ Google reCAPTCHA v3 protection
- ✅ Session management dengan NextAuth
- ✅ Database dengan Prisma + SQLite

## Instalasi

### 1. Setup Environment

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` dan isi:
- `NEXTAUTH_SECRET`: Generate dengan `openssl rand -base64 32`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Dapat dari Google reCAPTCHA Console
- `RECAPTCHA_SECRET_KEY`: Dapat dari Google reCAPTCHA Console

### 2. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push
```

### 3. Jalankan Aplikasi

```bash
npm run dev
```

Buka http://localhost:3000

## Google reCAPTCHA v3 Setup

1. Kunjungi https://www.google.com/recaptcha/admin
2. Klik "Create" (+)
3. Pilih "reCAPTCHA v3"
4. Isi domain: `localhost`
5. Copy site key dan secret key ke `.env`

## Struktur Halaman

- `/` - Halaman Login
- `/register` - Halaman Registrasi
- `/profile` - Halaman Profile User

## Teknologi

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn/ui
- **Backend**: NextAuth.js v5, Prisma ORM
- **Database**: SQLite (bisa diganti ke PostgreSQL)
- **Security**: Google reCAPTCHA v3, bcrypt untuk password hashing

## Error Handling

Sistem ini sudah include:
- Validasi form dengan Zod
- Error handling untuk reCAPTCHA
- Password validation
- User-friendly error messages

## Troubleshooting

### reCAPTCHA tidak muncul?
- Cek console untuk error messages
- Pastikan site key benar
- Cek koneksi internet

### Database error?
- Pastikan SQLite file bisa ditulis
- Cek permission folder

### Login gagal?
- Cek email dan password di database
- Pastikan reCAPTCHA score cukup (default: 0.5)