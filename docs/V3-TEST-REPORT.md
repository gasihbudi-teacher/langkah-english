# Laporan Validasi — Langkah English V3

## Pemeriksaan yang benar-benar berhasil
- `python tools/validate.py`: 19 resource, 80 pertanyaan termasuk latihan kecil di dalam materi; JSON, tautan aset, ID, referensi, jawaban, dan bukti teks bacaan dinyatakan valid.
- `node tests/scoring.mjs`: logika penilaian dan validasi jumlah soal/opsi tetap lulus.
- `node tests/v3-quality.mjs`: padanan kunci bahasa EN/ID, tujuh file HTML, referensi aset, keunikan ID HTML, 10 lessons + 9 quizzes, dan kunci penyimpanan lama lulus.
- `node --check` untuk seluruh berkas `js/*.js`: lulus.
- Pratinjau statis dengan mesin rendering Chromium menggunakan `page.set_content` untuk `grammar.html`, CSS asli, dan kartu tiruan: tidak ada horizontal overflow pada viewport 390px dan 1280px. Ini bukan uji pemuatan data dinamis.

## Belum bisa dibuktikan secara otomatis
- Browser lingkungan pengujian memblokir navigasi ke HTTP localhost dengan `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Karena itu, penggunaan browser end-to-end untuk melihat data JSON yang dimuat, perpindahan halaman, pengiriman kuis, penyimpanan progres, dan hasil kuis **belum dapat diotomatisasi di lingkungan ini**.
- Kajian pembelajaran adalah pemeriksaan penulisan dan logika internal; bukan verifikasi oleh guru/ahli independen atau badan UTBK.

## Pengujian manual yang disarankan sebelum publikasi
1. Dari `index.html`, klik tiga kartu jalur belajar; verifikasi pindah ke `grammar.html`, `utbk.html`, atau `school.html`.
2. Dari `school.html`, klik Kelas 9/10/11/12. Coba pencarian/filter dan kosongkan filter.
3. Dari `grammar.html`, buka kelima materi baru; baca isi, kerjakan latihan kecil, tandai selesai, dan periksa progres beranda.
4. Kerjakan setidaknya satu kuis baru (Mode Latihan dan Simulasi), periksa jawaban salah/benar/kosong, dan halaman hasil.
5. Gunakan pilihan ID/EN dan muat ulang untuk memastikan bahasa antarmuka tetap tersimpan.
6. Uji layar HP; perhatikan table scroll, tombol, navigasi, dan bacaan panjang.
7. Buka materi lama dan riwayat nilai lama untuk memastikan masih terbaca.
