# Langkah English V3 — Rangkuman Perubahan

## Halaman perpustakaan terpisah
- `grammar.html`: katalog Grammar Academy dengan pilihan tingkat dan filter.
- `utbk.html`: perpustakaan latihan pemahaman bacaan khusus UTBK.
- `school.html`: perpustakaan pelajaran sekolah dengan kartu Kelas 9–12.
- `js/pathway.js`: satu pengendali untuk ketiga halaman dengan data dari `data/catalog.json`.
- Kartu jalur belajar, tombol utama, navigasi atas, kartu kelas, dan tautan balik pelajaran/kuis diperbarui.

## Dukungan untuk pelajar pemula
- Bahasa antarmuka default menjadi Indonesia; preferensi EN/ID yang sudah tersimpan tetap berlaku.
- Penjelasan materi lama, petunjuk tugas, serta pembahasan soal lama dialihkan ke bahasa Indonesia.
- Contoh kalimat bahasa Inggris dan teks bacaan asli tetap berbahasa Inggris agar siswa dapat berlatih.
- Tidak ada API penerjemahan dan tidak ada akun pengguna.

## Lima unit grammar baru
- `parts-of-speech`, `sentence-structure`, `simple-past`, `present-continuous`, dan `basic-questions-negatives`.
- Setiap unit memiliki materi berstruktur, tujuan belajar, tabel/pola, contoh, kesalahan umum, tiga latihan langsung, dan kuis delapan soal.
- 10 berkas konten baru berada di `data/lessons/` dan `data/quizzes/`, dengan entri terdaftar di katalog.
- Tingkat Intermediate dan Advanced belum diisi; topik belum terbit masih dapat ditampilkan sebagai rencana belajar.

## Tetap kompatibel
- `langkah.progress.v1` (riwayat kemajuan) dan `langkah.draft.ID` (draf kuis) tidak berubah.
- ID materi lama dipertahankan.
- Hosting HTML/CSS/vanilla JS/JSON statis tetap menggunakan Cloudflare Pages, output `.` dan build `exit 0`.
- Tidak ada backend, framework baru, atau layanan berbayar.

## Cara memperbarui
1. Cadangkan commit situs aktif.
2. Ekstrak ZIP V3, unggah **isi** ZIP ke root repo GitHub lama tanpa membungkusnya dalam subfolder.
3. Commit perubahan ke branch utama atau gunakan branch pratinjau.
4. Uji semua halaman utama, pelajaran, kuis, hasil, dan navigasi di perangkat nyata.
5. Cloudflare Pages akan mendistribusikan hasil setelah commit.
