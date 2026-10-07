# Changelog

All notable changes to BisnisKu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Import File Penghasilan (Laporan Settlement) - October 8, 2026

#### Added — Sumber data biaya platform yang 100% akurat
Fitur import file **Laporan Penghasilan** — export terpisah dari Seller Center
yang berisi dana masuk dan semua potongan biaya per order. Sebelumnya biaya
platform hanya bisa diestimasi dari kolom diskon file pesanan; sekarang
angka persisnya diambil langsung dari settlement report.

- 🆕 Tabel `order_earnings` di `db/schema.ts` — 36 kolom (total penghasilan,
  harga produk, ongkir, 11 biaya platform, refund, info pembeli & kurir)
- 🆕 `services/earnings-parser.service.ts` — parser sheet "Penghasilan";
  melewatkan baris tipe "Sku" (519 baris) agar tiap order hanya dihitung
  sekali. Header Excel asli hanya ada di file ini (trademark safety)
- 🆕 `services/earnings.service.ts` — upsert per order number, agregasi
  statistik, match ke tabel orders
- 🆕 `POST /api/import-earnings` — upload file, parsing, upsert
- 🆕 `GET /api/earnings` — statistik agregat semua settlement
- 🆕 `GET /api/earnings/[orderNumber]` — data penghasilan satu order
- 🆕 Halaman Import sekarang punya **dua area upload** (File Pesanan +
  File Penghasilan) via komponen reusable `FileUploadZone`, dengan
  penjelasan bahwa keduanya dicocokkan otomatis by nomor pesanan
- 🆕 Panel **"Penghasilan Bersih Platform"** di dashboard: total penghasilan
  bersih, harga produk, total biaya platform (+ persentasenya), rincian
  11 biaya platform, komponen ongkir, dan diskon/cashback disponsor.
  Sebelum file di-import, tampil empty state yang mengarah ke halaman import
  (angka Rp 0 yang menyesatkan tidak pernah ditampilkan)
- 🆕 Section **"Penghasilan & Biaya Platform"** di order detail modal —
  penghasilan bersih order + rincian biaya, tanggal dana dilepaskan

#### Changed
- 🔄 `resetAllData()` sekarang juga menghapus `order_earnings` dan reset
  sequence-nya. Dialog konfirmasi di halaman import diperbarui
- 🔄 Halaman import: dropzone lama di-refactor menjadi `FileUploadZone`
  reusable (2 instance, accent biru & emerald)

#### Verified — Data Asli
- Import `penghasilan.xlsx`: **515 baris order** tersimpan, 519 baris SKU
  di-skip dengan benar, 0 error
- Match dengan file pesanan: **409 dari 515** order sukses dicocokkan;
  106 order di settlement belum ada di data pesanan (periodenya berbeda)
  — angka ini ditampilkan transparan di dashboard
- Validasi formula penghasilan: 20/20 order cocok dengan
  `Harga Produk + Ongkir + Gratis Ongkir + Semua Biaya − Refund`
- Dashboard menampilkan: Penghasilan Bersih Rp 29.499.293,
  Harga Produk Rp 48.801.785, Total Biaya Platform Rp 16.773.147 (34,4%),
  11 baris rincian biaya
- Order detail modal menampilkan section penghasilan untuk order yang match
  (contoh: 260901T1KY92H2 → Rp 50.875), dan tidak menampilkannya untuk
  order yang belum ada datanya
- Type-check clean (`tsc --noEmit` exit 0)

#### Fixed
- Query match earnings-vs-orders dengan `sql.join` mengembalikan semua baris
  sebagai unmatched → diganti select sederhana + Set lookup

---

### Pemisahan Fungsi Panel: Hapus Ongkir Estimasi - October 8, 2026

#### Problem
Panel "Rincian Potongan Platform" menampilkan "Perkiraan Ongkos Kirim"
Rp 5.998.185 dan "Estimasi Potongan Biaya Pengiriman" Rp 4.689.600. Angka
ini **estimasi** — file pesanan tidak menyimpan berapa ongkir yang benar-benar
dibayarkan ke jasa kirim. Sekarang angka realnya sudah ada di panel Penghasilan
Bersih Platform, sehingga bagian ongkir di panel potongan redundan dan
berpotensi membingungkan.

#### Changed — Opsi A: pisahkan tegas per fungsi
- 🔄 Panel **Rincian Potongan Platform** sekarang **hanya berisi potongan
  harga** (semuanya aktual dari file pesanan): diskon penjual/platform,
  voucher penjual/platform, koin, cashback, diskon kartu kredit. Bagian
  "Biaya Pengiriman" dihilangkan sepenuhnya
- 🔄 Prop `shipping` di `DiscountBreakdownCard` dihapus; layout grid 2 kolom
  tetap (kiri rincian, kanan penjelasan)
- 🔄 Catatan "Kenapa ini penting?" diperbarui: ada bullet baru yang menjelaskan
  panel ini **tidak memuat ongkir**, dan angka ongkir real ada di panel
  Penghasilan Bersih Platform

#### Result
Tidak ada lagi angka estimasi yang ditampilkan di dashboard. Tiap panel
memiliki satu sumber data yang jelas:
- Rincian Potongan Platform → file **pesanan**, potongan harga aktual
- Penghasilan Bersih Platform → file **penghasilan**, biaya + ongkir real,
  plus section Cek Silang

---

### Sinkronisasi Antar-File & Perbaikan Label - October 8, 2026

#### Problem
Panel "Penghasilan Bersih Platform" menampilkan baris **"Ongkir Dibayar
Pembeli Rp 6.713.185"**, padahal panel "Rincian Potongan Platform" menampilkan
"Ongkos Kirim Dibayar Pembeli Rp 854.985". Angka beda jauh, label hampir sama
— terlihat tidak sinkron.

Akar masalahnya **salah pasang label**: baris tersebut sebenarnya berisi
`shipping_paid_to_courier` (ongkir ke jasa kirim), bukan ongkir yang dibayar
pembeli. Angka aslinya adalah Rp 839.185 — hampir sama dengan file pesanan.

#### Fixed
- 🔄 Baris "Ongkir Dibayar Pembeli" sekarang memakai field yang benar
  (`shipping_paid_by_buyer` = Rp 839.185)
- 🆕 Baris baru **"Ongkir Dibayarkan ke Jasa Kirim"** (Rp 6.713.185) —
  total yang dibayarkan platform ke kurir, disubsidi gabungan gratis ongkir
  platform (Rp 5,4 juta) + ongkir pembeli

#### Added — Section "Cek Silang ke File Pesanan"
Karena kedua panel menghitung basis order berbeda (464 order Selesai vs 515
baris settlement), selisih totalnya selalu ada dan sebelumnya tidak
terjelaskan. Section baru ini **membatasi perbandingan ke 409 order yang ada
di kedua file** sehingga angkanya comparable:
- 🆕 `getEarningsReconciliation()` di `earnings.service.ts` — inner join
  orders × order_earnings, status Selesai
- 🆕 `mismatchCount` — jumlah order yang total dibayarnya beda antar file
- 🆕 Tiga metrik: Ongkir Dibayar Pembeli, Total Dibayar Pembeli, badge
  "✓ Sinkron / ⚠ Ada selisih" + penjelasan penyebab

#### Added — Penjelasan basis di panel
- 🆕 Panel Rincian Potongan: catatan bahwa angka ongkirnya **estimasi** dari
  file pesanan, dan mengarah ke panel Penghasilan untuk angka real + cek silang
- 🆕 Panel Penghasilan: penjelasan dari file mana tiap angka berasal

#### Verified — Data Asli (409 order Selesai di kedua file)
- **Ongkir Dibayar Pembeli: Rp 687.885 = Rp 687.885 — cocok persis, 0 selisih**
- Total Dibayar Pembeli: file pesanan Rp 35.362.975 vs settlement
  Rp 35.855.348 (selisih Rp 492.373)
- Hanya **8 dari 409 order** (2%) yang totalnya beda — semuanya tercatan
  Rp 0 di file pesanan tapi ada pembayarannya di settlement (perbedaan cara
  pencatatan export, bukan data hilang)
- Badge menampilkan "✓ Sinkron" karena ongkir cocok persis & rate mismatch
  di bawah 5%

---

### Backlog — Prioritas PR Berikutnya (Oct 8, 2026)

Hasil audit setelah fitur export selesai. Daftar ini adalah kandidat PR
berikutnya, urut berdasarkan dampak ke pemakaian sehari-hari:

| # | PR | Dampak | Effort | Catatan |
|---|----|--------|--------|---------|
| A | **Filter Periode** — quick filter (Hari Ini / 7 Hari / 30 Hari / Bulan Ini / Custom) di dashboard & halaman pesanan, export ikut periode yang dipilih | ⭐⭐⭐ | Kecil | Backend `dateFrom`/`dateTo` SUDAH ada di `order.service.ts`, tinggal bikin UI-nya |
| B | **Badge jumlah di sidebar** — "Perlu Dikirim (14)" langsung kelihatan tanpa buka halaman | ⭐⭐ | Kecil | |
| C | **Sorot deadline pengiriman** — di halaman Perlu Dikirim, pesanan yang `shipByDeadline`-nya sudah lewat/mendekati di-highlight merah + sortable | ⭐⭐⭐ | Kecil-Menengah | Kolomnya sudah ada, 14 pesanan perlu dikirim belum di-sort urgensi |
| D | **Bulk input harga modal** — isi modal semua produk sekaligus + tombol "Simpan Semua", atau import modal dari Excel/CSV | ⭐⭐⭐ | Menengah | Saat ini harus simpan per produk (83 produk = 83 klik). Fitur profit belum terpakai karena modal masih Rp 0 |
| E | **Analisis Pelanggan/Wilayah** — halaman baru: top kota, provinsi, repeat buyer, LTV | ⭐⭐ | Menengah | Data alamat & username pembeli sudah ada di DB |
| F | **Perbandingan Periode** — bulan ini vs bulan lalu, tampilan growth % | ⭐⭐ | Menengah | |
| G | **Print Packing Slip/Label** pengiriman dari detail pesanan | ⭐⭐ | Kecil-Menengah | |
| H | **Dark Mode** | ⭐ | Menengah | |

**Rekomendasi urutan pengerjaan**: A → B → C → D.

---

### Multi-Format Data Export - October 8, 2026

#### Added — Export CSV / Excel / PDF di Dashboard
- 🆕 `GET /api/export?type={orders|profit|stats}&format={csv|xlsx|pdf}` — 9 kombinasi
- 🆕 `services/export.service.ts` — generator untuk ketiga format
  (jsPDF + jspdf-autotable untuk PDF, SheetJS untuk Excel)
- 🆕 `components/dashboard/export-menu.tsx` — dropdown di header dashboard,
  dikelompokkan per jenis data, trigger download sungguhan + toast
- Pesanan: CSV & Excel berisi **semua 49 kolom**; PDF berupa tabel multi-halaman
  dengan kolom utama (termasuk alasan pembatalan)
- Profit: tabel per produk + summary cards (pendapatan, modal, laba, margin)
- Statistik: metrik dashboard, top 10 produk, metode pembayaran, tren pendapatan
- PDF punya header branded BisnisKu, nomor halaman, dan footer timestamp

#### Verified
- Semua 9 kombinasi return 200 dengan file valid
- CSV: 693 baris data, alasan pembatalan muncul, UTF-8 (BOM)
- Excel: re-parse via SheetJS — 676 baris × 50 kolom valid
- PDF: semua file valid (header `%PDF-`), 32 KB – 1,8 MB
- Flow client-side: klik opsi → download terjadi + toast "berhasil diunduh"

---

### Cancelled Orders Enhancement - October 7, 2026

#### Added
- Kolom **Alasan Pembatalan** di halaman Dibatalkan (conditional, hanya muncul
  di status tersebut), badge merah, teks utuh (wrap, bukan truncate)

#### Fixed
- Alasan pembatalan sebelumnya dipotong (truncate) → sekarang tampil full text
  dengan `whitespace-normal break-words`

---

### Reset Data Feature - October 7, 2026

#### Added
- `DELETE /api/reset` + `resetAllData()` di order service
- Komponen `ConfirmDialog` reusable
- Tombol "Reset Data" di halaman Import dengan dialog konfirmasi — menghapus
  SEMUA data (orders + product costs + import history)

#### Verified
- 698 orders + 1 product + 6 history → 0 semua setelah reset

---

### License & Authorship - October 7, 2026

#### Added
- `LICENSE` — MIT, `Copyright (c) 2026 Pandu Dargah`
- `package.json` author: `Pandu Dargah`
- README license section

---

### Rebranding - October 7, 2026

#### Changed — Trademark Safety
Removed all marketplace brand references to avoid trademark/copyright issues:
- 🔄 UI text "Shopee Dashboard" → "Marketplace Dashboard"
- 🔄 App metadata description → generic "Marketplace Order Management"
- 🔄 Order detail labels ("Diskon dari Shopee" → "Diskon dari Platform",
  "Voucher Ditanggung Shopee" → "Voucher Ditanggung Platform",
  "Potongan Koin Shopee" → "Potongan Koin Platform")
- 🔄 Import page instructions → "Marketplace Seller Center"
- 🔄 `parseShopeeDate` → `parseMarketplaceDate`

#### Refactored — Decouple export format from domain model
- `RawOrder` type now uses generic field names instead of raw Excel headers
- Excel header strings are now isolated in a single adapter
  (`excel-parser.service.ts`) — the only module referencing the export format
- Renamed DB columns: `shopee_discount` → `platform_discount`,
  `shopee_voucher` → `platform_voucher`,
  `package_discount_shopee` → `package_discount_platform`,
  `shopee_coin_deduction` → `platform_coin_deduction`
- Renamed TS fields: `shopeeDiscount` → `platformDiscount`, etc.

#### Added
- `scripts/import-excel.ts` — CLI tool to re-import the Excel export
- `scripts/verify-data.ts` — data verification/sanity check tool

#### Verified
- Re-imported 670 orders with the new pipeline (9 dupes skipped)
- Status counts unchanged: 10 pending / 213 shipped / 328 completed / 119 cancelled
- Revenue unchanged: Rp 27.517.101 (completed orders)
- Production build passes (18 routes), type-check clean

---

### Planning Phase - October 7, 2026

#### Added
- ✅ Complete PRD (Product Requirements Document)
- ✅ Development roadmap (7 weeks timeline)
- ✅ Progress tracking system
- ✅ Detailed project structure
- ✅ README with setup instructions
- ✅ Git configuration files

#### In Progress
- 🚧 Next.js project initialization
- 🚧 Database schema design
- 🚧 Core dependencies setup

---

## [1.0.0] - 2026-10-07

### Core Features
- Excel import from Marketplace Seller Center (drag & drop, 49 columns)
- SQLite database with Drizzle ORM
- Dashboard with real-time stats and 4 interactive charts
- 5 order pages with smart status filtering:
  - Semua Pesanan (All Orders)
  - Perlu Dikirim (Pending Shipment)
  - Dikirim (Shipped)
  - Selesai (Completed)
  - Dibatalkan (Cancelled)
- Order detail modal displaying all 49 fields
- Profit analysis with product cost management
- Global search and pagination
- Responsive design with Framer Motion animations
- Toast notifications

### Technical
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + custom UI components
- Framer Motion for animations
- Recharts for data visualization
- SQLite + Drizzle ORM
- Marketplace status mapping engine

### Verified With Real Data
- 670 orders imported from actual marketplace export
- Status filtering: 10 pending / 213 shipped / 328 completed / 119 cancelled
- Revenue: Rp 27.517.101
- Top products: Knop Baut Ketupat, Velocity Stack, etc.

### Bug Fixes
- Fixed dummy data override: removed legacy `src/` prototype that
  Next.js prioritized over root `app/` directory
- Fixed `components.json` and `drizzle.config.ts` paths after
  removing `src/` folder
- Fixed database lock issue with singleton connection pattern

---

## Planned Releases

### [1.0.0] - Phase 1.0 MVP - Target: October 27, 2026

#### Features
- Excel import functionality (drag & drop)
- Dashboard with key metrics (5 metric cards)
- All orders page with table
- Pending shipment orders page
- Shipped orders page
- Completed orders page
- Cancelled orders page
- Order detail modal (49 fields)
- Search & filter functionality
- Date range picker
- Status filters
- Basic charts (2-3 charts)

#### Technical
- Next.js 14 setup
- SQLite database with Drizzle ORM
- API routes for data fetching
- Tailwind CSS styling
- shadcn/ui components
- TypeScript strict mode

---

### [1.1.0] - Phase 1.1 Enhancement - Target: November 11, 2026

#### Features
- Professional animations (Framer Motion)
- Advanced charts (5+ chart types)
- Export to CSV/Excel
- Responsive design (desktop & tablet)
- Loading states & skeletons
- Error boundaries
- Toast notifications

#### Improvements
- Performance optimization
- Better error messages
- Smooth page transitions
- Micro-interactions
- Counter animations

---

### [1.2.0] - Phase 1.2 Profit - Target: November 25, 2026

#### Features
- Product cost management page
- Input modal for product costs
- Bulk import costs from CSV
- Profit calculation engine
- Profit analytics dashboard
- Performance report by product
- ROI calculations
- Profit charts (area, bar)
- Best/worst performing products

#### Technical
- Profit calculation algorithms
- Products database table
- Profit API endpoints
- Enhanced statistics

---

### [2.0.0] - Phase 2.0 Advanced - Target: Q1 2027

#### Planned Features
- Multi-file import support
- Dark mode toggle
- Multi-language (EN/ID)
- Custom date range reports
- Email notifications
- Advanced filtering
- Saved filter presets
- Courier API integration
- Auto-refresh data

> ℹ️ **PDF export, CSV/Excel export, dan reset data sudah selesai** —
> lihat bagian [Unreleased] di atas.

---

## Version History

### Convention
```
[Version] - Release Date

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security fixes
```

---

**Last Updated**: October 8, 2026  
**Latest Commit**: `c1c62fc` — feat: import file penghasilan + rincian biaya platform
