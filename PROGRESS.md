# 📊 BisnisKu - Development Progress Tracker

**Last Updated**: October 10, 2026  
**Current Phase**: Phase 1.0 COMPLETE — Enhancement & Profit hampir selesai  
**Overall Progress**: 97%

---

## 🎯 Current Status: WORKING WITH REAL DATA ✅

Aplikasi sudah berjalan dengan **DATA ASLI** dari file Excel marketplace Anda
dan sudah ter-push ke GitHub. Ini BUKAN data dummy/mockup — semua angka
berasal dari file `semua.xlsx` yang Anda export dari Marketplace Seller Center.

### 🐙 Repository
- **URL**: https://github.com/panzauto46-bot/Bisnisku
- **Branch**: `master`
- **Latest Commit**: `6728509` - feat: landing page profesional + restrukturisasi route groups
- **Files**: 80+ files, 22.000+ baris kode

### Verifikasi Data (Oct 7, 2026)

| Metric | Value | Status |
|--------|-------|--------|
| Total Pesanan | 670 | ✅ Verified |
| Perlu Dikirim | 10 | ✅ Verified |
| Dikirim | 213 | ✅ Verified |
| Selesai | 328 | ✅ Verified |
| Dibatalkan | 119 | ✅ Verified |
| Total Pendapatan | Rp 27.517.101 | ✅ Verified |
| Total Diskon | Rp 17.307.840 | ✅ Verified |
| Total Ongkir | Rp 995.985 | ✅ Verified |
| Tingkat Penyelesaian | 49.0% | ✅ Verified |
| Tingkat Pembatalan | 17.8% | ✅ Verified |

---

## 📈 Overall Progress

```
██████████████████████████████████████████████████░░ 90%
```

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1.0 - MVP | 98% | 🟢 Complete |
| Phase 1.1 - Enhancement | 95% | 🟢 Export selesai, tinggal filter periode |
| Phase 1.2 - Profit Analysis | 85% | 🟡 Engine siap, modal produk belum diisi |

---

## ✨ Update Terbaru (Oct 7-10, 2026)

### Landing Page Profesional (Oct 10) — commit `6728509`
- Landing page publik di route `/` (full animasi Framer Motion):
  hero dengan animated mockup, 6 features, cara kerja 3 langkah,
  pricing 2 kartu, FAQ accordion, CTA + footer
- Aplikasi dipindah ke route group `(app)`, landing page di
  `(marketing)` — sidebar tidak bocor ke landing page
- Harga: Rp 20.000/bulan & Rp 220.000/tahun; paket tahunan
  "Hemat Rp 20.000 — bayar 11 bulan, dapat 12 bulan"
- Link Dashboard `/` → `/dashboard` (sidebar, header, upload zone)
- Selanjutnya (Fase 2): halaman login key + middleware proteksi +
  sistem generate key di DB lokal

### Export Penghasilan Platform (Oct 10) — commit `0e3797e`
- Tipe export baru **"Penghasilan"** → menu Export Data sekarang 12 opsi
  (CSV/Excel/PDF × Pesanan/Profit/Statistik/Penghasilan)
- PDF profesional: summary cards + **grafik komposisi biaya platform** +
  grafik penghasilan per tanggal + tabel rincian multi-halaman
- Semua order di-export; yang belum cair diberi status "Belum Cair"
### Badge "Sudah Cair / Belum Cair" (Oct 10) — commit `5b7d2f0`
- Kolom **Penghasilan** di tabel pesanan: ✓ Sudah Cair / ⏳ Belum Cair /
  ✕ Tidak Ada. Murni baca `order_earnings` (hasil import Excel), tanpa API
- Berguna membedakan order yang wajar belum punya rincian biaya vs yang
  seharusnya sudah ada (file penghasilan perlu di-download ulang)

### Rincian Penghasilan Gaya Marketplace (Oct 9-10) — commits `6f09175`..`4793684`
- Detail modal: section "Harga & Diskon" + "Penghasilan & Biaya Platform"
  digabung jadi satu flow **"Rincian Penghasilan"** seperti Seller Center
- Urutan: Subtotal Pesanan → Voucher & Subsidi → Total Pembayaran →
  Biaya Platform / Gratis Ongkir XTRA / Layanan / Promosi / Lainnya /
  Pajak → Estimasi Total Penghasilan
- Fix: Subtotal Pesanan sempat salah menjumlahkan Harga Sebelum Diskon
  (Rp 158.400 → seharusnya Rp 68.400)
- Section "Cek Silang" dihapus seluruhnya (validasi teknis, tidak bernilai
  bisnis)

### Insight Cara Kerja File Penghasilan (Oct 10)
- File penghasilan di-filter per **bulan pelepasan dana**, bukan bulan
  order. Order Mei yang selesai Juni → dananya lepas Juni → ada di file
  penghasilan Juni, bukan Mei
- Diverifikasi dengan data test periode Mei: 523 order, 412 data
  penghasilan (parser 0 gagal — 412 unik di file = 412 di DB). 77 order
  Selesai tanpa penghasilan karena selesainya Juni (dananya lepas Juni)

### Import File Penghasilan (Oct 8) — commits `c1c62fc`..`4161b05`
- Tabel `order_earnings` + parser sheet "Penghasilan" (36 kolom, skip baris SKU)
- Panel **Penghasilan Bersih Platform** di dashboard + section di order detail
- Dua area upload di halaman Import, match otomatis by nomor pesanan
- Data asli: 515 baris settlement, 409 match, Penghasilan Bersih Rp 29.499.293,
  Total Biaya Platform Rp 16.773.147 (34,4% dari harga produk)

### Multi-Format Export (Oct 8) — commit `3b8d5d9`
- Tambah `GET /api/export?type={orders|profit|stats}&format={csv|xlsx|pdf}`
- 9 kombinasi export, semua teruji return 200 + file valid
- Dropdown `ExportMenu` di header dashboard, download sungguhan + toast

### Reset Data (Oct 7) — commit `4671287`
- `DELETE /api/reset` + `resetAllData()`
- Dialog konfirmasi reusable, tombol di halaman Import
- Tested: 698 orders + 1 product + 6 history → 0

### Kolom Alasan Pembatalan (Oct 7) — commit `09c3bf5` + `868084c`
- Kolom conditional di halaman Dibatalkan, badge merah
- Awalnya `truncate` → diperbaiki jadi full text wrap

### License & Authorship (Oct 7) — commit `b8529b6`
- MIT License, Copyright (c) 2026 Pandu Dargah

---

## 🔧 Bug Fixes (Oct 7, 2026)

### Critical Fix: Dummy Data Override
**Issue**: Next.js memprioritaskan `src/app` jika ada, sehingga browser
menampilkan prototype lama dengan data dummy ("1,248", "#ORD-9001")
alih-alih implementasi asli di root `app/`.

**Solution**:
- ✅ Hapus folder `src/` (prototype lama dengan data dummy)
- ✅ Fix `components.json` (css path: `src/app/globals.css` → `app/globals.css`)
- ✅ Fix `drizzle.config.ts` (schema path: `./src/db/schema.ts` → `./db/schema.ts`)
- ✅ Update `PROJECT_STRUCTURE.md` (tsconfig paths)
- ✅ Verifikasi browser menampilkan data asli (670, Rp 27.517.101)
- ✅ Production build pass (18 routes)

**Result**: Dashboard sekarang menampilkan 100% data asli dari Excel.

---

## 🔒 Trademark Safety Rebrand (Oct 7, 2026)

**Issue**: Aplikasi masih mengandung nama brand "Shopee" di banyak tempat,
yang berisiko kena hak cipta/sanksi trademark.

**Solution**:
- ✅ Semua teks UI diganti jadi generik ("Marketplace Dashboard",
  "Diskon dari Platform", "Marketplace Seller Center", dll.)
- ✅ `RawOrder` type di-refactor pakai nama field generik (bukan header Excel)
- ✅ String header Excel diisolasi di satu file adapter
  (`excel-parser.service.ts`) — satu-satunya tempat yang menyentuh format export
- ✅ Kolom DB di-rename: `shopee_*` → `platform_*`
- ✅ Database di-recreate & data re-import: 670 orders (verified sama persis)
- ✅ Production build pass, type-check clean

**Result**: Tidak ada lagi nama brand marketplace di UI maupun kode domain.

---

## ✅ COMPLETED FEATURES (Working & Tested)

### 1. Project Setup ✅
- [x] Next.js 14 + TypeScript initialized
- [x] Tailwind CSS configured
- [x] UI components (Card, Button, Badge)
- [x] ESLint & Prettier configured
- [x] Import alias `@/*` configured
- [x] Production build passes (no type errors)

### 2. Database ✅
- [x] SQLite database setup (`data/database.db`)
- [x] Drizzle ORM configured
- [x] 4 tables: orders, products, import_history, order_earnings
- [x] Indexes for performance
- [x] Singleton connection pattern (fixes DB lock)
- [x] Setup script (`scripts/setup-db.ts`)

### 3. Excel Import ✅ (TESTED WITH REAL FILE)
- [x] Drag & drop upload UI with animations
- [x] Excel parser service (49 columns)
- [x] Column validation (required columns check)
- [x] Data normalization & cleaning
- [x] Duplicate detection (by order number)
- [x] Import history tracking
- [x] Error handling & user feedback
- [x] File type & size validation (.xlsx/.xls, max 50MB)
- [x] **REAL TEST: 670 orders imported** (9 dupes skipped)

### 4. Dashboard ✅ (VERIFIED WITH REAL DATA)
- [x] 5 metric cards (Semua, Perlu Dikirim, Dikirim, Selesai, Dibatalkan)
- [x] 4 revenue cards (Pendapatan, AOV, Diskon, Ongkir)
- [x] Revenue trend chart (animated area chart)
- [x] Status distribution pie chart
- [x] Top 10 produk terlaris bar chart
- [x] Metode pembayaran donut chart
- [x] Tingkat penyelesaian & pembatalan progress bars
- [x] Animated counters (Framer Motion)

### 5. Order Pages ✅ (ALL 5 WORKING)
- [x] Semua Pesanan (`/orders`)
- [x] Perlu Dikirim (`/pending`)
- [x] Dikirim (`/shipped`)
- [x] Selesai (`/completed`)
- [x] Dibatalkan (`/cancelled`)
- [x] Status filtering logic (verified: 10/213/328/119, sum = 670)
- [x] Interactive data table with pagination
- [x] Sortable by date
- [x] Global search (order #, product, buyer, resi)
- [x] Status badges with colors
- [x] Loading & empty states
- [x] Responsive mobile menu

### 6. Order Detail Modal ✅
- [x] Displays ALL 49 fields from Excel
- [x] Organized in sections (Produk, Harga, Pengiriman, Pembeli, Timeline)
- [x] Copy-to-clipboard buttons
- [x] Cancellation reason alert
- [x] Buyer/seller notes display
- [x] Smooth modal animations
- [x] **Section Penghasilan & Biaya Platform** (data dari file settlement)

### 7. Profit Analysis ✅ (PARTIAL)
- [x] Product cost management page
- [x] Input harga modal per produk
- [x] Save cost to database
- [x] Profit calculation engine
- [x] Performance report table (sorted by profit)
- [x] Margin & ROI calculation
- [x] Profit stats cards
- [x] Warning when no costs set
- [x] Best/worst product highlighting

### 8. UI/UX ✅
- [x] Framer Motion animations throughout
- [x] Page load animations
- [x] Card hover effects
- [x] Staggered list animations
- [x] Loading skeletons/states
- [x] Toast notifications (sonner)
- [x] Professional color scheme
- [x] Responsive sidebar (desktop + mobile)
- [x] Smooth transitions

### 9. API Endpoints ✅ (ALL WORKING)
- [x] `POST /api/import` - Upload Excel
- [x] `GET /api/orders` - List with filters/pagination
- [x] `GET /api/orders/[id]` - Order detail
- [x] `GET /api/stats` - Dashboard statistics
- [x] `GET /api/charts/revenue` - Revenue trend
- [x] `GET /api/charts/products` - Top products
- [x] `GET /api/charts/payment-methods` - Payment distribution
- [x] `GET/POST /api/products` - Product cost management
- [x] `GET /api/profit` - Profit analysis
- [x] `DELETE /api/reset` - Reset semua data
- [x] `GET /api/export?type=&format=` - Export CSV/Excel/PDF
- [x] `POST /api/import-earnings` - Upload file Laporan Penghasilan
- [x] `GET /api/earnings` - Statistik agregat penghasilan
- [x] `GET /api/earnings/[orderNumber]` - Penghasilan per order

### 10. Export Multi-Format ✅ (VERIFIED)
- [x] CSV — semua 49 kolom, UTF-8 (BOM), siap olah di Excel
- [x] Excel (.xlsx) — SheetJS, sheet terpisah per jenis data
- [x] PDF — jsPDF + autotable, header branded, nomor halaman, footer
- [x] 3 jenis data: Pesanan, Profit, Statistik
- [x] Dropdown menu di header dashboard (9 opsi)
- [x] Download sungguhan via browser + toast notifikasi
- [x] Nama file otomatis ikut tanggal (mis. `bisnisku-orders-2026-10-08.csv`)

### 11. Reset Data ✅ (VERIFIED)
- [x] Hapus SEMUA data (orders + penghasilan + product costs + import history)
- [x] Dialog konfirmasi reusable (`ConfirmDialog`)
- [x] Tombol di halaman Import
- [x] Tested: 698 orders + 1 product + 6 history → 0 semua

### 12. Import File Penghasilan ✅ (VERIFIED WITH REAL DATA)
- [x] Parser sheet "Penghasilan" — deteksi header 2-baris, filter tipe "Order",
  skip baris "Sku"
- [x] Upsert per order number (import ulang = refresh angka, bukan duplikat)
- [x] Match otomatis dengan file pesanan by nomor pesanan
- [x] Panel dashboard: Penghasilan Bersih, Harga Produk, Total Biaya Platform
  (+ persentase), 11 rincian biaya, komponen ongkir, diskon disponsor
- [x] Empty state sebelum import (tidak menampilkan Rp 0 yang menyesatkan)
- [x] Section penghasilan di order detail modal
- [x] **REAL TEST: 515 baris order tersimpan, 519 baris SKU di-skip,
  409/515 match dengan file pesanan**

---

## 🚧 REMAINING TASKS

### Phase 1.0 - MVP (2% remaining)
- [x] Git repository init & first commit
- [x] Push to GitHub (https://github.com/panzauto46-bot/Bisnisku)
- [ ] Final end-to-end testing

### Phase 1.1 - Enhancement (5% remaining)
- [x] Export table to CSV/Excel ✅ (Oct 8)
- [x] PDF export ✅ (Oct 8)
- [ ] **PR-A** Date range picker / filter periode
- [ ] Advanced filters (province, city, price range)
- [ ] Error boundary components
- [ ] Empty state illustrations

### Phase 1.2 - Profit Analysis (15% remaining)
- [ ] **PR-D** Bulk import costs (Simpan Semua / import Excel)
- [ ] Profit trend chart over time
- [ ] ROI visualization
- [ ] Marketplace fee configuration

### Backlog PR Berikutnya (post-1.2, lihat CHANGELOG.md untuk detail)
- [ ] **PR-A** Filter Periode — quick filter + custom range, export ikut periode
- [ ] **PR-B** Badge jumlah pesanan di sidebar
- [ ] **PR-C** Sorot & sort deadline pengiriman yang sudah lewat
- [ ] **PR-E** Analisis Pelanggan/Wilayah (kota, provinsi, repeat buyer)
- [ ] **PR-F** Perbandingan Periode (bulan ini vs bulan lalu)
- [ ] **PR-G** Print Packing Slip/Label pengiriman
- [ ] **PR-H** Dark Mode

---

## 🐛 Known Issues

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Port 3000 in use (using 3001) | Low | ⚠️ Workaround |
| 2 | AnimatedCounter shows 0 during first second (animation) | Low | ✅ By design |
| 3 | Dev server compile slow on first page visit | Low | ✅ Expected |
| 4 | `next build` + `next dev` barengan → cache `.next` korup | Medium | ⚠️ Hindari |
| 5 | `/api/stats` bisa ter-cache (bukan force-dynamic) | Low | ⚠️ Reload jika stale |

---

## 📁 Files Created

### Source Code
```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Dashboard (+ ExportMenu + EarningsPanel)
├── globals.css                   # Global styles
├── api/
│   ├── import/route.ts
│   ├── import-earnings/route.ts  # POST — file Laporan Penghasilan
│   ├── orders/route.ts
│   ├── orders/[id]/route.ts
│   ├── stats/route.ts
│   ├── charts/revenue/route.ts
│   ├── charts/products/route.ts
│   ├── charts/payment-methods/route.ts
│   ├── products/route.ts
│   ├── profit/route.ts
│   ├── earnings/route.ts         # GET — stats agregat penghasilan
│   ├── earnings/[orderNumber]/route.ts
│   ├── reset/route.ts            # DELETE — reset semua data
│   └── export/route.ts           # GET — CSV/Excel/PDF
├── orders/page.tsx
├── pending/page.tsx
├── shipped/page.tsx
├── completed/page.tsx
├── cancelled/page.tsx
├── import/page.tsx               # 2 area upload (pesanan + penghasilan) + Reset
└── profit/page.tsx

components/
├── layout/sidebar.tsx
├── layout/header.tsx
├── dashboard/metric-card.tsx
├── dashboard/export-menu.tsx      # Dropdown export 9 opsi
├── dashboard/discount-breakdown.tsx
├── dashboard/earnings-panel.tsx   # Panel Penghasilan Bersih Platform
├── import/file-upload-zone.tsx    # Dropzone reusable (2 instance)
├── orders/orders-table.tsx
├── orders/order-detail-modal.tsx
├── orders/order-earnings-section.tsx
├── charts/revenue-chart.tsx
├── charts/status-chart.tsx
├── charts/top-products-chart.tsx
├── charts/payment-chart.tsx
├── shared/status-badge.tsx
├── shared/animated-counter.tsx
├── shared/confirm-dialog.tsx     # Dialog konfirmasi reusable
├── ui/card.tsx
└── ui/button.tsx

services/
├── excel-parser.service.ts       # 49-column parser (adapter Excel headers)
├── earnings-parser.service.ts    # Parser sheet Penghasilan (adapter headers)
├── order.service.ts              # Status mapping + queries + reset
├── earnings.service.ts           # Upsert + agregasi penghasilan
├── profit.service.ts             # Profit calculations
└── export.service.ts             # CSV/Excel/PDF generators

db/
├── index.ts                      # SQLite connection
└── schema.ts                     # Drizzle schema (4 tables)

utils/
├── format.ts                     # Currency/number formatting
└── date.ts                       # Date parsing (marketplace format)

types/
├── order.types.ts                # Order types
└── earnings.types.ts             # Settlement/earnings types

scripts/
├── setup-db.ts                   # DB initialization
├── check-statuses.ts             # Debug status mapping
└── check-category.ts             # Verify category logic
```

### Documentation
```
├── PRD.md                        # Product requirements
├── ROADMAP.md                    # Development roadmap
├── PROGRESS.md                   # This file
├── PROJECT_STRUCTURE.md          # Code structure
├── README.md                     # Setup guide
├── SUMMARY.md                    # Project summary
├── STATUS.md                     # Status overview
├── CHANGELOG.md                  # Version history
└── LICENSE                       # MIT
```

---

## 🎯 Next Priorities

**Urutan rekomendasi (dari audit Oct 8, 2026):**

1. **PR-A — Filter Periode** ⭐ prioritas tertinggi
   - Backend `dateFrom`/`dateTo` SUDAH ada di `order.service.ts` (baris 143-186)
   - Tinggal bikin UI: quick filter (Hari Ini / 7 Hari / 30 Hari / Bulan Ini)
     + custom range picker
   - Dashboard, halaman pesanan, dan export ikut periode yang dipilih

2. **PR-B — Badge jumlah di sidebar**
   - "Perlu Dikirim (14)" langsung kelihatan tanpa buka halaman

3. **PR-C — Sorot deadline pengiriman**
   - Kolom `shipByDeadline` sudah ada; pesanan lewat deadline di-highlight merah
   - Sort by urgency di halaman Perlu Dikirim

4. **PR-D — Bulk input harga modal**
   - Sekarang simpan per produk (83 produk = 83 klik) → fitur profit belum dipakai
   - "Simpan Semua" sekaligus + opsi import modal dari Excel/CSV

---

## 🏃 How to Run

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Start dev server
npm run dev

# Open browser
# http://localhost:3000 (or 3001 if 3000 is in use)
```

---

**Last Updated**: October 10, 2026  
**Status**: 🟢 Working with real data  
**Latest Commit**: `6728509` - feat: landing page profesional + restrukturisasi route groups
**Next Update**: Setelah PR-A (filter periode)
