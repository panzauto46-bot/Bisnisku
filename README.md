# 🚀 BisnisKu

> Professional Dashboard for Marketplace Order Management & Analytics

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Overview

**BisnisKu** adalah aplikasi desktop berbasis web yang dirancang untuk membantu marketplace sellers mengelola pesanan mereka dengan mudah. Aplikasi ini mengotomatisasi proses analisis data dari file Excel export marketplace dengan visualisasi yang profesional dan interaktif.

### ✨ Key Features

- 📊 **Dashboard Analytics** - Visualisasi data real-time dengan charts profesional
- 📦 **Order Management** - Kelola semua pesanan dalam satu tempat
- 🎯 **Smart Filtering** - Filter otomatis berdasarkan status pesanan
- 💰 **Profit Analysis** - Hitung profit bersih per produk
- 📤 **Easy Import** - Drag & drop Excel file dari Marketplace
- 💵 **Import File Penghasilan** - Upload Laporan Penghasilan untuk lihat
  penghasilan bersih & rincian SEMUA biaya platform yang dipotong (admin,
  transaksi, promo, ongkir XTRA, PPh, dll). Kedua file dicocokkan otomatis
  by nomor pesanan
- 📋 **Rincian Penghasilan Gaya Marketplace** - Klik pesanan apa pun untuk
  lihat perhitungan lengkap dari Subtotal Pesanan sampai Estimasi Total
  Penghasilan, persis seperti di Seller Center: voucher & subsidi, biaya
  platform, gratis ongkir XTRA, biaya layanan, promosi, pajak
- 💚 **Badge Sudah Cair / Belum Cair** - Tabel pesanan menandai order mana
  yang dananya sudah dilepas platform (rincian lengkap) vs yang belum —
  dibaca murni dari hasil import Excel Anda, tanpa koneksi API marketplace
- 🏠 **Landing Page Profesional** - Halaman publik di route `/` dengan
  animasi: hero, fitur, cara kerja, pricing (Rp 20.000/bulan,
  Rp 220.000/tahun), FAQ, dan CTA pembelian
- 📥 **Multi-Format Export** - Download data sebagai CSV, Excel (.xlsx), atau PDF
  untuk 4 jenis data: **Pesanan**, **Profit**, **Statistik**, dan
  **Penghasilan Platform** (12 opsi total). PDF Penghasilan profesional
  dengan grafik komposisi biaya platform dan penghasilan per tanggal
- 🗑️ **Reset Data** - Hapus semua data kembali ke kondisi kosong, kapan saja
- 🎨 **Beautiful UI** - Modern interface dengan smooth animations
- ⚡ **Fast Performance** - Handle 1000+ orders dengan mudah
- 🔒 **Privacy First** - Semua data tersimpan lokal (SQLite)

---

## 🖼️ Screenshots

*Coming soon after implementation*

---

## 🎯 Target Users

- Marketplace sellers yang ingin analisis data lebih mudah
- Small to medium business owners
- Siapa saja yang butuh dashboard profesional untuk data marketplace

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Tables**: TanStack Table

### Backend
- **Runtime**: Node.js (API routes) + Edge (middleware)
- **Database**: SQLite via libSQL — file lokal di development, **Turso** di
  production (Vercel)
- **ORM**: Drizzle ORM
- **Excel Parser**: xlsx
- **API**: Next.js API Routes
- **License**: Ed25519-signed license files + HMAC session cookies

---

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Node.js** >= 18.17.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (sudah bundled dengan Node.js)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/panzauto46-bot/Bisnisku.git
cd Bisnisku
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Salin `.env.example` jadi `.env.local`, lalu isi `LICENSE_SECRET`:

```bash
cp .env.example .env.local

# Generate secret untuk menandatangani session cookie
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Tempel hasilnya ke `LICENSE_SECRET` di `.env.local`.

### 4. Setup Database

```bash
npm run db:setup
```

Secara default ini membuat file SQLite lokal di `data/database.db`.
Untuk production (Vercel), set `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`
lihat bagian **Deployment** di bawah.

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 📦 Installation (Detailed)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Setup

Buat file `.env.local` di root folder (lihat `.env.example`):

```env
# Database (opsional di development — kosong = pakai file lokal)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# WAJIB. Secret untuk menandatangani session cookie.
LICENSE_SECRET=

# Public key untuk verifikasi license file.
# Di-generate otomatis saat pertama kali menjalankan `npm run license:gen`.
LICENSE_PUBLIC_KEY=
```

### Step 3: Database Setup

```bash
npm run db:setup
```

### Step 4: Start Development

```bash
npm run dev
```

---

## 🔐 Sistem License

BisnisKu adalah produk berbayar (Rp 20.000/bulan, Rp 220.000/tahun).
Akses ke aplikasi dijaga oleh **license file** yang ditandatangani secara
kriptografis (Ed25519), bukan key string yang bisa ditebak.

### Cara kerja

1. **Anda (penjual)** menjalankan generator untuk membuat license file:

   ```bash
   npm run license:gen                     # paket tahunan (default)
   npm run license:gen -- --plan monthly   # paket bulanan
   npm run license:gen -- --plan yearly --count 5
   ```

   atau cukup **double-click `Generator-License.bat`** di folder proyek.

   Saat pertama kali dijalankan, generator membuat sepasang kunci:
   - `data/license-private.key` — **RAHASIA**, hanya ada di komputer Anda,
     tidak pernah di-commit dan tidak pernah dikirim ke pembeli
   - `data/license-public.key` — public key, sudah ditanam di kode aplikasi

   License file dibuat di folder `licenses/BISNISKU-<id>.dat`.

2. **Pembeli** meng-upload file `.dat` itu di halaman **/login**. Aplikasi
   memverifikasi tanda tangan dengan public key (offline, tanpa hubungan
   ke server Anda), lalu mencatat fingerprint perangkat pembeli.

3. **Satu license = satu perangkat.** File yang sama di-upload dari
   perangkat lain akan ditolak (409). Jika pembeli ganti komputer, mereka
   butuh license file baru.

### Keamanan

- Pembeli tidak bisa memalsukan license: butuh private key yang hanya ada
  di tangan Anda.
- Session cookie ditandatangani dengan `LICENSE_SECRET` — tanpa env var ini
  aplikasi menolas membuat session (tidak ada default hardcoded).
- Middleware Edge memblokir semua route aplikasi kecuali ada cookie valid.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |
| `npm run db:setup` | Buat tabel database |
| `npm run db:push` | Push schema changes via Drizzle Kit |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run license:gen` | Generate license file untuk pembeli |

---

## 📖 Usage Guide

### 1. Import Data dari Marketplace

**File Pesanan** (wajib):
1. Login ke **Marketplace Seller Center**
2. Pergi ke **My Income** → **My Orders**
3. Klik **Export** → Pilih date range → Download Excel
4. Buka **BisnisKu** → **Import Data**
5. Upload file pesanan di area **"1. File Pesanan"** (drag & drop atau klik)
6. Wait for processing (biasanya < 5 detik)

**File Penghasilan** (opsional, tapi sangat direkomendasikan):
1. Di Seller Center, buka menu **Finance / Saldo** → **Laporan Penghasilan**
2. Download periode yang sama dengan file pesanan
3. Upload di area **"2. File Penghasilan"**
4. Panel **"Penghasilan Bersih Platform"** muncul di dashboard — berisi
   penghasilan bersih dan rincian semua biaya platform yang dipotong

Kedua file dicocokkan otomatis **berdasarkan nomor pesanan**. Order yang ada
di file penghasilan tapi belum ada di file pesanan tetap disimpan dan ditandai
sebagai "belum ada di data pesanan".

> 💡 Import file pesanan dulu, baru file penghasilan. Kalau periodenya sama,
> hampir semua order akan ter-match.

### 2. Navigasi Dashboard

**Sidebar Menu**:
- 🏠 **Dashboard** - Overview & statistics
- 📦 **Semua Pesanan** - All orders
- ⏳ **Perlu Dikirim** - Pending shipment
- 🚚 **Dikirim** - In transit
- ✅ **Selesai** - Completed
- ❌ **Dibatalkan** - Cancelled
- 💰 **Analisis Profit** - Profit analytics
- 📤 **Import Data** - Upload new data

### 3. Filter & Search Orders

- **Search**: Cari by nomor pesanan, nama produk, username pembeli, nama penerima,
  atau nomor resi — tersedia di setiap halaman pesanan
- **Status**: Pindah antar halaman (Semua / Perlu Dikirim / Dikirim / Selesai /
  Dibatalkan) untuk filter by status
- **Pagination**: 10 / 25 / 50 / 100 baris per halaman

> ℹ️ **Filter periode (date range), price range, dan lokasi ada di backlog** —
> lihat `CHANGELOG.md` bagian Backlog PR-A sampai PR-E.

### 4. View Order Details

Klik pada row order untuk melihat detail lengkap (49 fields):
- Order information
- Product details
- Pricing & discounts
- **Penghasilan & Biaya Platform** — data dari file Laporan Penghasilan
  (hanya muncul kalau order ada di file yang di-import): penghasilan bersih,
  tanggal dana dilepaskan, rincian setiap biaya platform
- Shipping information
- Customer information
- Timeline

### 5. Export Data (CSV / Excel / PDF)

Dari halaman **Dashboard**, klik tombol **Export Data** di kanan atas:

- **Data Pesanan** — CSV (49 kolom lengkap), Excel, atau PDF tabel multi-halaman
- **Analisis Profit** — CSV, Excel (dengan ringkasan), atau PDF laporan
- **Statistik Dashboard** — CSV, Excel, atau PDF laporan ringkasan (1-2 halaman)

File otomatis terdownload dengan nama `bisnisku-{tipe}-{tanggal}.{format}`.

### 6. Analisis Profit

1. Pergi ke **Analisis Profit** → **Kelola Harga Modal**
2. Input harga pokok (modal) per produk, lalu klik **Simpan**
3. Sistem otomatis calculate profit, margin, dan ROI
4. Lihat produk terbaik/terburuk berdasarkan laba
5. Export laporan profit lewat tombol Export Data di Dashboard

> ⚠️ Saat ini input modal harus per produk satu-satu. Bulk input
> ("Simpan Semua" / import Excel) ada di backlog **PR-D**.

### 7. Reset Data

Pergi ke **Import Data** → klik **Reset Data** untuk menghapus SEMUA data
(orders + penghasilan + harga modal + riwayat import) kembali ke kondisi
kosong. Ada dialog konfirmasi sebelum penghapusan.

---

## 📁 Project Structure

```
bisnisku/
├── app/                 # Next.js pages & API routes
├── components/          # React components
├── db/                  # Database layer (schema + connection)
├── services/            # Business logic (parser, orders, profit)
├── hooks/               # Custom hooks
├── utils/               # Utilities (currency, date, cn)
├── types/               # TypeScript types
├── scripts/             # DB setup & import scripts
├── public/              # Static assets
├── data/                # SQLite database (gitignored)
└── docs/                # Documentation
```

Detail lengkap: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## ☁️ Deployment (Vercel + Turso)

Aplikasi ini didesain untuk deploy di **Vercel**. Karena serverless Vercel
tidak menyimpan file secara permanen, databasenya pakai **Turso** (SQLite
hosted via HTTP) — bukan file SQLite lokal.

### 1. Buat database Turso (gratis)

1. Daftar di [turso.tech](https://turso.tech)
2. Buat database, lalu ambil URL dan token:
   ```bash
   turso db create bisnisku
   turso db tokens create bisnisku
   ```
3. Jalankan migrasi ke database remote:
   ```bash
   TURSO_DATABASE_URL=libsql://bisnisku-xxxx.turso.io \
   TURSO_AUTH_TOKEN=xxxxx \
   npm run db:setup
   ```

### 2. Set Environment Variables di Vercel

Di **Project Settings → Environment Variables**, isi:

| Variable | Nilai |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://bisnisku-xxxx.turso.io` |
| `TURSO_AUTH_TOKEN` | token dari `turso db tokens create` |
| `LICENSE_SECRET` | hasil `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `LICENSE_PUBLIC_KEY` | public key dari `data/license-public.key` |

> ⚠️ **`LICENSE_SECRET` wajib di-set.** Tanpa itu aplikasi tidak bisa
> membuat session cookie dan semua percobaan login akan gagal.

### 3. Deploy

```bash
vercel
```

Atau hubungkan repo GitHub ini ke Vercel untuk auto-deploy tiap push.

### Catatan

- **Generator license tetap jalan di komputer Anda** — dia hanya butuh
  `data/license-private.key` yang ada di lokal. Deploy Vercel tidak
  memengaruhi kemampuan generate license.
- **Jangan pernah commit** `data/` (sudah di-gitignore) atau `.env.local`.
- File SQLite lokal (`data/database.db`) hanya untuk development.

---

## 🗺️ Roadmap

### ✅ Phase 1.0 - MVP (Week 1-3) — DONE
- [x] Project setup
- [x] Import Excel functionality
- [x] Dashboard with basic metrics
- [x] All 5 order status pages
- [x] Search & filtering
- [x] Order detail view

### ✅ Phase 1.1 - Enhancement (Week 4-5) — DONE
- [x] Professional animations
- [x] Advanced charts
- [x] Export functionality (CSV / Excel / PDF)
- [x] Import file penghasilan + rincian biaya platform
- [x] Responsive design
- [x] Error handling & loading states

### ⏳ Phase 1.2 - Profit Analysis (Week 6-7)
- [x] Product cost management
- [x] Profit calculation
- [x] Performance reports
- [x] ROI analytics
- [ ] Bulk input modal (PR-D)

### 🔮 Backlog Berikutnya (post-1.2)
- **PR-A** Filter periode (Hari Ini / 7 / 30 Hari / Bulan Ini / Custom)
- **PR-B** Badge jumlah pesanan di sidebar
- **PR-C** Sorot & sort deadline pengiriman lewat
- **PR-D** Bulk input harga modal
- **PR-E** Analisis pelanggan/wilayah
- **PR-F** Perbandingan periode
- **PR-G** Print packing slip/label
- **PR-H** Dark mode

### 🔮 Phase 2.0 - Future
- Multi-file import
- Multi-language (EN/ID)
- Email notifications
- Mobile app version

Detail lengkap: [ROADMAP.md](./ROADMAP.md)

---

## 🧪 Testing

Belum ada automated test suite. Verifikasi manual:

```bash
npm run type-check   # TypeScript
npm run lint         # ESLint
npm run build        # production build
```

---

## 📚 Documentation

- **[PRD.md](./PRD.md)** - Complete product requirements
- **[ROADMAP.md](./ROADMAP.md)** - Development roadmap
- **[PROGRESS.md](./PROGRESS.md)** - Current progress
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Code structure
- **[docs/USER_GUIDE.md](./docs/USER_GUIDE.md)** - User guide (TBD)
- **[docs/API_DOCS.md](./docs/API_DOCS.md)** - API documentation (TBD)
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Developer guide (TBD)

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
refactor: code refactoring
docs: documentation update
style: code formatting
test: add tests
chore: maintenance tasks
```

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write TypeScript with strict mode
- Add JSDoc comments for complex functions

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Error
```bash
# Reset database
rm -rf data/database.db
pnpm db:migrate
```

#### 2. Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### 3. Dependencies Error
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. TypeScript Errors
```bash
# Clean TypeScript cache
rm -rf .next
pnpm type-check
```

---

## 📊 Performance

### Benchmarks

- **Import 1000 rows**: ~3-5 seconds
- **Page load time**: < 1 second
- **Chart render**: < 500ms
- **Search/filter**: < 100ms

### Optimization Tips

- Enable production mode for best performance
- Use pagination for large datasets
- Leverage React.memo for expensive components
- Use proper database indexes

---

## 🔒 Security

### Data Privacy
- ✅ All data stored locally (SQLite)
- ✅ No external API calls with sensitive data
- ✅ Customer PII handled carefully
- ✅ Input validation on all forms
- ✅ SQL injection prevention

### Best Practices
- Keep dependencies updated
- Follow OWASP guidelines
- Regular security audits

---

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not supported)

---

## 🌟 Credits

### Built With
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Recharts](https://recharts.org/) - Charts library
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM

### Inspiration
- Marketplace Seller Center dashboards
- Modern analytics dashboards
- E-commerce management tools

---

## 📄 License

MIT License - Copyright (c) 2026 **Pandu Dargah**. See [LICENSE](./LICENSE) for details.

---

## 💬 Support

### Get Help
- 📧 Email: support@bisnisku.com (example)
- 💬 Discord: [Join our community](#) (TBD)
- 🐛 Issues: [GitHub Issues](https://github.com/panzauto46-bot/Bisnisku/issues)
- 📖 Docs: [Documentation](#)

---

## 🙏 Acknowledgments

Terima kasih kepada:
- Marketplace platform yang digunakan seller Indonesia
- Open source community
- All contributors

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/panzauto46-bot/Bisnisku?style=social)
![GitHub forks](https://img.shields.io/github/forks/panzauto46-bot/Bisnisku?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/panzauto46-bot/Bisnisku?style=social)

---

## 🚀 What's Next?

Setelah Phase 1 selesai, kami akan fokus pada:
- 📱 Mobile app version
- 🌐 Multi-marketplace support (Tokopedia, Lazada)
- 🤖 AI-powered insights
- ☁️ Cloud sync option
- 👥 Team collaboration features

---

<div align="center">

**Made with ❤️ for Marketplace Sellers**

[⭐ Star this project](https://github.com/panzauto46-bot/Bisnisku) | [🐛 Report Bug](https://github.com/panzauto46-bot/Bisnisku/issues) | [💡 Request Feature](https://github.com/panzauto46-bot/Bisnisku/issues)

</div>
