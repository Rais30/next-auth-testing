## Akar Masalah
- Token reCAPTCHA v3 hanya bisa diverifikasi sekali dan berlaku ±2 menit. Saat ini token yang sama diverifikasi di dua tempat: `/api/auth/login` dan `authorize` NextAuth → menyebabkan `invalid-input-response`.
- Potensi mismatch site/secret key, domain allowlist dan pemeriksaan `action`.

## Rencana Perubahan
1. Konsolidasi verifikasi ke NextAuth saja
- Client: di `src/app/page.tsx`, hapus panggilan pre-check ke `/api/auth/login`. Setelah `executeRecaptcha('login')`, langsung panggil `signIn('credentials', { email, password, captcha, redirect: false })` agar token digunakan satu kali.
- Server: biarkan verifikasi v3 di `src/lib/auth.ts` dengan `validateRecaptcha(...)` yang sudah ada.

2. Perbaikan `recaptcha-service.ts`
- `src/lib/recaptcha-service.ts`:
  - Hapus logging sensitif `console.log({data, params})` dan perkuat pesan error khusus untuk `invalid-input-response`.
  - Tambahkan opsi `actionExpected?: string` di `validateRecaptcha(token, actionExpected = 'login', minScore)` agar pesan mismatch action lebih deskriptif.
  - Opsional: terima `remoteip` dan kirim ke Google (bukan wajib, tapi membantu diagnostik).

3. Guard & UX di Client
- Tampilkan pesan khusus jika verifikasi gagal karena: skor rendah, action mismatch, atau token invalid.
- Pastikan tombol submit disabled saat `!isReady` dan regenerate token bila terjadi error (panggil `resetRecaptcha`).

4. Konfigurasi Lingkungan
- Pastikan pasangan kunci cocok: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` dan `RECAPTCHA_SECRET_KEY` dari proyek yang sama.
- Tambahkan domain yang digunakan ke allowlist Google: `localhost`, `127.0.0.1`, dan IP lokal jika dipakai.
- Untuk dev, set `RECAPTCHA_SKIP_ACTION_CHECK=1` bila Anda ingin mengabaikan mismatch action sementara.

## Output yang Diharapkan
- Tidak ada lagi `invalid-input-response` karena token tidak diverifikasi dua kali.
- Pesan error reCAPTCHA lebih jelas dan tidak membocorkan data sensitif.
- Alur login lebih sederhana dan aman (single verification di server).