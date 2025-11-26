## Ringkasan Analisis
- Fungsi `onSubmit` memverifikasi reCAPTCHA (`executeRecaptcha('login')`), memanggil API custom `/api/auth/login`, lalu melanjutkan ke `signIn('credentials')` milik NextAuth jika `response.ok` (src/app/page.tsx:41–90).
- Penanganan kesalahan ada, namun belum konsisten dan ada kebocoran log sensitif (`console.log({result})`) (src/app/page.tsx:69).
- Saat `signIn` berhasil, tidak ada redirect langsung; UI bergantung pada `isAuthenticated` untuk merender tampilan sukses (src/app/page.tsx:115–142). Ini bekerja, tapi UX bisa dibuat lebih jelas.
- Validasi reCAPTCHA hanya terjadi di endpoint custom. Jika kredensial provider NextAuth tidak ikut memverifikasi token, penyerang dapat mencoba bypass dengan memukul endpoint NextAuth langsung.

## Masalah yang Ditemukan
- Logging data respons potensial sensitif (src/app/page.tsx:69).
- Tidak memeriksa keberhasilan `signIn` secara eksplisit (mis. `ok/url`) dan tidak ada umpan balik sukses/redirect.
- Ketergantungan pada API pre-check `/api/auth/login` tanpa memastikan verifikasi reCAPTCHA di sisi NextAuth (potensi bypass).
- Parsing `response.json()` tanpa guard ketika body kosong atau bukan JSON dapat melempar error yang tidak tertangkap khusus.
- Pencocokan pesan error berbasis substring (`includes('reCAPTCHA')`) rapuh.

## Rencana Perbaikan (Client)
1. Hapus logging sensitif.
2. Perketat penanganan error respons:
   - Bungkus `response.json()` dengan try/catch; fallback ke pesan umum jika gagal.
   - Tampilkan detail error terstruktur dari API jika ada `code`/`message`.
3. Perjelas alur sukses `signIn`:
   - Periksa `signInResult?.ok` atau `signInResult?.url`.
   - Redirect ke `/profile` via `router.replace('/profile')` saat sukses.
4. Perkuat penanganan error `signIn`:
   - Tampilkan pesan dari `signInResult.error` jika tersedia.
   - Bedakan error validasi vs. error server.

## Rencana Perbaikan (Server/NextAuth)
1. Integrasi verifikasi reCAPTCHA ke `authorize` Credentials Provider NextAuth:
   - Terima `recaptchaToken` dari client di `signIn('credentials', { ... })`.
   - Verifikasi ke Google reCAPTCHA di sisi server, sebelum validasi kredensial.
2. Opsional: Konsolidasikan alur login:
   - Hilangkan pre-check `/api/auth/login` dan lakukan seluruh verifikasi (reCAPTCHA + kredensial + rate-limit) dalam NextAuth.
   - Atau pertahankan endpoint, tapi tetap wajib verifikasi reCAPTCHA di `authorize` untuk mencegah bypass.

## Langkah Implementasi Konkret
- Client (src/app/page.tsx):
  - Hapus `console.log({result})` (src/app/page.tsx:69).
  - Tambahkan guard parsing JSON dan mapping error yang konsisten.
  - Kirim `recaptchaToken` ke `signIn('credentials', { email, password, recaptchaToken, redirect: false })`.
  - Redirect ke `/profile` saat `signIn` sukses.
- Server:
  - Update konfigurasi NextAuth `[...nextauth].ts`: tambahkan field `recaptchaToken` pada `credentials` dan verifikasi ke Google sebelum autentikasi.
  - Pastikan endpoint `/api/auth/login` (jika tetap digunakan) mengembalikan struktur error konsisten (`{ code, message }`).

## Hasil yang Diharapkan
- Alur login lebih aman (reCAPTCHA diverifikasi di server NextAuth).
- UX lebih jelas: pengguna diarahkan otomatis saat login sukses.
- Error handling lebih robust dan tidak membocorkan informasi sensitif.

Mohon konfirmasi untuk melanjutkan implementasi sesuai rencana di atas.