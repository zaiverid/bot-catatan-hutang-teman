# BOT TELEGRAM CATATAN HUTANG TEMAN 


📱 Bot Catatan Hutang Teman - Panduan Instalasi Termux (Android)

📋 Persyaratan

· Android 7.0+
· Koneksi internet
· Akun Telegram

🚀 Langkah Instalasi di Termux

1. Install Termux

Download Termux dari:

· F-Droid
· Atau Play Store (versi legacy)

2. Update & Upgrade Package

```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
```

3. Clone Repository

```bash
cd ~
git clone https://github.com/zaiverid/bot-catatan-utang-teman.git
cd bot-catatan-utang-teman
```

4. Install Dependencies

```bash
npm install
```

5. Konfigurasi Bot

```bash
# Edit file index.js untuk menambahkan token bot
nano index.js
```

Tekan tombol volume atas + K untuk keyboard
Cari baris ini:

```javascript
const token = 'TOKEN_BOT_ANDA';
```

Ganti TOKEN_BOT_ANDA dengan token dari @BotFather

Simpan dengan:

· CTRL + X
· Y
· Enter

6. Dapatkan Token Bot

1. Buka Telegram
2. Cari @BotFather
3. Kirim: /newbot
4. Ikuti instruksi
5. Copy token yang diberikan

7. Jalankan Bot

```bash
node index.js
```

🛠️ Perbaikan Error Umum

Error: Cannot find module

```bash
npm install node-telegram-bot-api
```

Error: Permission denied

```bash
termux-setup-storage
chmod +x index.js
```

Error: Port already in use

```bash
pkill -f node
node index.js
```

📁 Struktur File

```
bot-catatan-utang-teman/
├── index.js          # File utama bot
├── data.json         # Database hutang
├── package.json      # Dependencies
└── README.md         # Panduan ini
```

🔑 Cara Mendapatkan Token Bot

1. Buka Telegram di HP
2. Search @BotFather
3. Kirim pesan: /newbot
4. Berikan nama bot: HutangBot
5. Berikan username: namabot_anda_bot
6. Copy token yang diberikan (misal: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)
7. Paste token di file index.js

🎯 Fitur Bot

✅ Tambah Hutang - Catat hutang teman
✅ Lihat Hutang - Tampilkan semua hutang
✅ Bayar Hutang - Kurangi jumlah hutang
✅ Ranking 10 - 10 hutang terbesar
✅ Ringkasan - Statistik hutang
✅ Hapus Hutang - Hapus data hutang
✅ Keyboard - Tanpa perlu ketik command

⚙️ Running di Background

```bash
# Gunakan screen untuk menjaga bot tetap jalan
pkg install screen -y
screen -S hutangbot
node index.js
```

Untuk keluar tanpa stop bot:

· CTRL + A
· D

Untuk kembali ke session:

```bash
screen -r hutangbot
```

🚫 Stop Bot

```bash
# Di dalam session screen:
CTRL + C

# Atau dari luar:
pkill -f node
```

🔄 Update Bot

```bash
cd ~/bot-catatan-utang-teman
git pull
npm install
node index.js
```

📞 Troubleshooting

Bot tidak merespon:

1. Cek token sudah benar
2. Pastikan internet aktif
3. Restart Termux

Command tidak bekerja:

1. Pastikan bot sudah di-start
2. Cek dengan /start
3. Pastikan menggunakan keyboard yang muncul

Data hilang:

Data tersimpan di data.json - jangan hapus file ini

💡 Tips

· Simpan token di tempat aman
· Backup file data.json secara berkala
· Gunakan screen agar bot tetap jalan saat Termux ditutup
· Update Termux secara berkala: pkg update

📚 Support

Jika ada masalah:

1. Baca error message di Termux
2. Pastikan semua langkah diikuti
3. Cek koneksi internet
4. Restart Termux dan jalankan ulang

⚠️ Catatan Penting

· Bot hanya berjalan saat Termux aktif
· Untuk 24/7, pertimbangkan hosting VPS/Raspberry Pi
· Data lokal hanya di HP Anda
· Backup data.json sebelum update

Bot siap digunakan! 🎉
