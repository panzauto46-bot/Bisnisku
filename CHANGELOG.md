# Changelog

All notable changes to BisnisKu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Excel import from Shopee Seller Center (drag & drop, 49 columns)
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
- Shopee status mapping engine

### Verified With Real Data
- 670 orders imported from actual Shopee export
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
- PDF export
- Advanced filtering
- Saved filter presets
- Courier API integration
- Auto-refresh data

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

**Last Updated**: October 7, 2026
