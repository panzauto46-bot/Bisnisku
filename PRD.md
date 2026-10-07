# Product Requirements Document (PRD)
# BisnisKu - Professional Marketplace Order Management Dashboard

## 📋 Document Information
- **Product Name**: BisnisKu
- **Version**: 1.0.0
- **Last Updated**: October 7, 2026
- **Status**: Phase 1.0 Complete
- **Document Owner**: Development Team

---

## 🎯 Executive Summary

BisnisKu adalah aplikasi desktop berbasis web yang dirancang untuk membantu marketplace seller mengelola pesanan mereka secara efisien dengan visualisasi data yang profesional dan interaktif. Aplikasi ini mengotomatisasi proses filtering dan analisis data pesanan yang diekspor dari marketplace.

### Problem Statement
- Marketplace seller kesulitan menganalisis data pesanan dari file Excel export
- Tidak ada visualisasi yang mudah dipahami untuk tracking performa penjualan
- Sulit menghitung profit bersih karena banyak komponen (diskon, ongkir, fee)
- Proses manual filtering data memakan waktu

### Solution
Dashboard interaktif yang:
- Auto-import dan parsing file Excel export marketplace
- Filter otomatis berdasarkan status pesanan
- Visualisasi data dengan chart dan grafik profesional
- Kalkulasi profit otomatis
- UI/UX modern dengan animasi smooth

---

## 👥 Target Users

### Primary Users
- **Marketplace Sellers** yang ingin menganalisis performa penjualan
- **Small to Medium Business Owners** yang mengelola toko online

### User Persona
- **Name**: Pemilik Toko Motor Parts
- **Age**: 25-45
- **Tech Savviness**: Medium
- **Pain Points**: 
  - Terlalu banyak waktu untuk analisis manual
  - Sulit tracking pesanan yang perlu ditindaklanjuti
  - Tidak tahu produk mana yang paling profitable

---

## 🎨 Product Vision & Goals

### Vision
Menjadi dashboard terbaik untuk marketplace sellers dalam mengelola dan menganalisis pesanan dengan cara yang visual, intuitif, dan profesional.

### Goals
1. **Efficiency**: Reduce order analysis time by 80%
2. **Insight**: Provide actionable insights untuk decision making
3. **User Experience**: Create delightful, professional UI/UX
4. **Accuracy**: 100% accurate profit calculation

---

## ✨ Core Features

### 1. Dashboard Overview (Homepage)
**Priority**: P0 (Must Have)

#### Description
Halaman utama yang menampilkan summary metrics dan visualisasi key performance indicators.

#### Components
- **Metric Cards** (5 cards dengan animasi hover)
  - Semua Pesanan (Total count)
  - Pesanan Perlu Dikirim (Pending shipment)
  - Pesanan Dikirim (In transit)
  - Pesanan Selesai (Completed)
  - Pesanan Dibatalkan (Cancelled)
  
- **Charts & Graphs**
  - Line Chart: Trend penjualan harian/mingguan/bulanan
  - Bar Chart: Top 10 produk terlaris
  - Pie Chart: Distribusi status pesanan
  - Donut Chart: Distribusi metode pembayaran
  - Area Chart: Revenue vs Profit over time

- **Statistics Panel**
  - Total Revenue (Rp)
  - Total Profit (Rp)
  - Average Order Value (AOV)
  - Conversion Rate
  - Total Discount Given
  - Total Shipping Cost

#### Animations
- Smooth fade-in on load
- Counter animation untuk numbers
- Chart animation on render
- Hover effects pada cards
- Skeleton loading state

---

### 2. Import Data
**Priority**: P0 (Must Have)

#### Description
Fitur untuk import file Excel export dari marketplace.

#### Functionality
- **Drag & Drop Upload**
  - Support .xlsx and .xls format
  - File validation
  - Progress bar saat upload
  
- **Auto-Detection**
  - Detect semua kolom dari file Excel
  - Validate struktur data (49 kolom expected)
  - Warning jika ada missing columns
  
- **Data Parsing**
  - Parse 679+ rows efficiently
  - Handle Indonesian date format
  - Clean and normalize data
  - Store to SQLite database
  
- **Import History**
  - Track semua file yang pernah di-import
  - Timestamp import
  - File name & size
  - Records count

#### Error Handling
- Invalid file format
- Corrupted data
- Missing required columns
- Duplicate imports

---

### 3. Semua Pesanan (All Orders)
**Priority**: P0 (Must Have)

#### Description
Halaman yang menampilkan semua pesanan dalam bentuk tabel interaktif.

#### Features
- **Data Table**
  - Pagination (10/25/50/100 per page)
  - Sortable columns
  - Search/filter global
  - Export to CSV/Excel
  - Column visibility toggle
  
- **Columns Displayed** (Prioritized)
  - No. Pesanan
  - Status Badge (colored)
  - Nama Produk
  - Nama Variasi
  - Harga Setelah Diskon
  - Jumlah
  - Total Pembayaran
  - Metode Pembayaran
  - Waktu Pesanan Dibuat
  - Actions (View Detail)
  
- **Advanced Filters**
  - Date range picker
  - Status multi-select
  - Price range slider
  - Payment method filter
  - Province/City filter
  - Product name search

#### Detail View (Modal/Slide-over)
Ketika klik suatu row, tampilkan detail lengkap:
- **Order Information**
  - All 49 fields dari Excel
  - Organized in sections
  - Copy-able text
  
- **Sections**
  1. Order Summary
  2. Product Details
  3. Pricing & Discounts
  4. Shipping Information
  5. Customer Information
  6. Timeline

---

### 4. Pesanan Perlu Dikirim
**Priority**: P0 (Must Have)

#### Description
Filtered view untuk pesanan yang sudah dibayar tapi belum dikirim.

#### Filter Logic
```
Status != 'Selesai' AND 
Status != 'Batal' AND
Status != 'Dikirim' AND
Waktu Pembayaran IS NOT NULL
```

#### Features
- Same table functionality as "Semua Pesanan"
- Highlight urgent orders (mendekati deadline pengiriman)
- Bulk actions:
  - Print resi labels
  - Export shipping list
  - Mark as shipped (future feature)
  
- **Action Required Indicators**
  - Red badge: Harus dikirim hari ini
  - Yellow badge: Harus dikirim besok
  - Green badge: Masih aman

---

### 5. Pesanan Dikirim
**Priority**: P0 (Must Have)

#### Description
Pesanan yang sedang dalam pengiriman.

#### Filter Logic
```
Status = 'Sedang Dikirim' OR
(No. Resi IS NOT NULL AND Status != 'Selesai' AND Status != 'Batal')
```

#### Features
- Same table functionality
- Show "No. Resi" prominently
- Show courier/shipping method
- Estimated delivery date
- Copy resi number button
- Link to courier tracking (if available)

---

### 6. Pesanan Selesai
**Priority**: P0 (Must Have)

#### Description
Pesanan yang telah selesai/completed.

#### Filter Logic
```
Status = 'Selesai'
```

#### Features
- Same table functionality
- Show "Waktu Pesanan Selesai"
- Customer satisfaction indicator (if available)
- Stats:
  - Total completed orders
  - Total revenue from completed
  - Average delivery time

---

### 7. Pesanan Dibatalkan
**Priority**: P0 (Must Have)

#### Description
Pesanan yang dibatalkan oleh pembeli atau seller.

#### Filter Logic
```
Status = 'Batal' OR 
Status = 'Dibatalkan'
```

#### Features
- Same table functionality
- Show "Alasan Pembatalan" prominently
- Cancellation analytics:
  - Top cancellation reasons
  - Cancellation rate
  - Lost revenue from cancellations
  
- **Insights Panel**
  - Most cancelled products
  - Cancellation trend over time
  - Actionable recommendations

---

### 8. Analisis Profit
**Priority**: P1 (Should Have - Phase 1.1)

#### Description
Fitur untuk menghitung dan menganalisis profit bersih.

#### Components

##### 8.1 Product Cost Management
- **Input Modal Produk**
  - Table untuk input harga pokok per produk
  - Import from CSV
  - Bulk edit
  - Product name auto-complete
  
##### 8.2 Profit Calculator
Formula:
```
Profit = (Harga Setelah Diskon × Jumlah) 
         - (Modal × Jumlah)
         - Ongkos Kirim Seller Paid
         - Fee Marketplace (estimasi)
         - Diskon Dari Penjual
```

##### 8.3 Profit Dashboard
- **Metrics**
  - Total Profit (Rp)
  - Profit Margin (%)
  - Best performing products
  - Worst performing products
  
- **Charts**
  - Profit trend over time
  - Profit by product category
  - Profit by region
  - ROI comparison

##### 8.4 Product Performance Report
- Sortable by profit
- Show:
  - Product name
  - Units sold
  - Revenue
  - Cost
  - Profit
  - Margin %
  - ROI %

---

## 🎨 UI/UX Design Specifications

### Design Principles
1. **Professional**: Clean, modern, business-focused
2. **Intuitive**: Easy navigation, clear hierarchy
3. **Responsive**: Works on desktop (primary) and tablet
4. **Accessible**: WCAG 2.1 AA compliance
5. **Delightful**: Smooth animations, pleasant interactions

### Color Scheme
```
Primary: #3B82F6 (Blue)
Secondary: #10B981 (Green)
Accent: #F59E0B (Amber)
Danger: #EF4444 (Red)
Warning: #F59E0B (Orange)
Success: #10B981 (Green)

Background: #F9FAFB (Light Gray)
Surface: #FFFFFF (White)
Text Primary: #111827 (Dark Gray)
Text Secondary: #6B7280 (Medium Gray)
```

### Typography
```
Font Family: 'Inter' (primary), 'System UI' (fallback)

Headings:
- H1: 2.5rem (40px), Bold
- H2: 2rem (32px), Semibold
- H3: 1.5rem (24px), Semibold
- H4: 1.25rem (20px), Medium

Body:
- Large: 1.125rem (18px)
- Regular: 1rem (16px)
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)
```

### Spacing System
```
Base unit: 4px

Spacing scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
```

### Animation Guidelines

#### Timing
```
Fast: 150ms (hover, toggles)
Normal: 300ms (modals, dropdowns)
Slow: 500ms (page transitions, charts)
```

#### Easing
```
ease-in: Hover out
ease-out: Hover in, Appear
ease-in-out: Transitions, Slides
spring: Premium feel (Framer Motion)
```

#### Animation Types
1. **Micro-interactions**
   - Button hover/active states
   - Input focus states
   - Checkbox/toggle animations
   
2. **Page Transitions**
   - Fade + slide up
   - Stagger children animation
   
3. **Data Visualization**
   - Chart draw animation
   - Number counter animation
   - Progress bar animation
   
4. **Loading States**
   - Skeleton screens
   - Spinner (only when necessary)
   - Progress indicators

### Component Library
Use **shadcn/ui** + **Tailwind CSS** for:
- Consistent design system
- Pre-built accessible components
- Easy customization
- Dark mode support (future)

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand / React Context
- **Table**: TanStack Table (React Table v8)
- **Date Handling**: date-fns

#### Backend
- **Runtime**: Node.js (built-in with Next.js)
- **API**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **File Upload**: Formidable / Multer
- **Excel Parsing**: xlsx / exceljs

#### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

### Database Schema

#### Tables

**orders**
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  cancellation_reason TEXT,
  tracking_number TEXT,
  shipping_option TEXT,
  order_created_at DATETIME,
  payment_completed_at DATETIME,
  order_completed_at DATETIME,
  payment_method TEXT,
  product_name TEXT,
  variant_name TEXT,
  original_price REAL,
  discounted_price REAL,
  quantity INTEGER,
  subtotal REAL,
  total_discount REAL,
  seller_discount REAL,
  platform_discount REAL,
  shipping_fee REAL,
  total_payment REAL,
  buyer_username TEXT,
  recipient_name TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  buyer_note TEXT,
  seller_note TEXT,
  -- Additional fields for all 49 columns
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**products**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT UNIQUE NOT NULL,
  cost_price REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**import_history**
```sql
CREATE TABLE import_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  records_count INTEGER,
  imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'success'
);
```

### API Endpoints

```
POST   /api/import          - Upload & parse Excel file
GET    /api/orders          - Get all orders with filters
GET    /api/orders/:id      - Get single order detail
GET    /api/stats           - Get dashboard statistics
GET    /api/charts/revenue  - Get revenue chart data
GET    /api/charts/products - Get top products data

POST   /api/products        - Create/update product cost
GET    /api/products        - Get all products
GET    /api/profit          - Get profit analysis
```

---

## 📱 User Flow

### First Time User
1. Open application → Welcome screen
2. Click "Import Data" → Drag & drop Excel file
3. System parses → Show success message
4. Redirect to Dashboard → See overview
5. Explore different sections via sidebar

### Returning User
1. Open application → Dashboard (with existing data)
2. Option to import new data (append or replace)
3. Navigate using sidebar menu
4. Filter and analyze data

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)
1. **User Engagement**
   - Daily active sessions
   - Average session duration
   - Feature usage frequency
   
2. **Performance**
   - Page load time < 1s
   - Import processing time < 5s for 1000 rows
   - Chart render time < 500ms
   
3. **User Satisfaction**
   - Task completion rate > 95%
   - Error rate < 1%
   - User feedback score

---

## 🚀 Development Roadmap

### Phase 1.0 - MVP (Week 1-3)
**Goal**: Core functionality working

- ✅ Project setup & architecture
- ✅ Database design & setup
- ✅ Import Excel functionality
- ✅ Dashboard overview (basic)
- ✅ All 5 order status pages
- ✅ Basic filtering & search
- ✅ Detail view modal

### Phase 1.1 - Enhancement (Week 4-5)
**Goal**: Professional UI/UX

- ✅ Implement animations (Framer Motion)
- ✅ Advanced charts & visualizations
- ✅ Responsive design
- ✅ Loading states & error handling
- ✅ Export functionality

### Phase 1.2 - Profit Analysis (Week 6-7)
**Goal**: Add profit features

- ✅ Product cost management
- ✅ Profit calculation engine
- ✅ Profit analytics dashboard
- ✅ Performance reports

### Phase 2.0 - Advanced Features (Future)
**Goal**: Scale & optimize

- 🔲 Multi-file import
- 🔲 Auto-refresh data
- 🔲 Custom date range reports
- 🔲 Email notifications
- 🔲 Dark mode
- 🔲 Multi-language support
- 🔲 Export to PDF reports
- 🔲 Integration with courier APIs

---

## 🧪 Testing Strategy

### Unit Tests
- Utility functions (date parsing, currency formatting)
- Data transformation logic
- Calculation functions (profit, statistics)

### Integration Tests
- API endpoints
- Database operations
- Excel import flow

### E2E Tests
- Critical user journeys
- Import → View → Filter flow
- Profit calculation flow

### Manual Testing
- UI/UX polish
- Animation smoothness
- Cross-browser compatibility (Chrome, Firefox, Edge)

---

## 🔒 Security Considerations

1. **Data Privacy**
   - All data stored locally (SQLite)
   - No external API calls with sensitive data
   - Customer PII handled carefully
   
2. **Input Validation**
   - File type validation
   - File size limits (max 50MB)
   - SQL injection prevention (parameterized queries)
   
3. **Error Handling**
   - Graceful degradation
   - User-friendly error messages
   - Detailed logging for debugging

---

## 📚 Documentation Plan

1. **README.md** - Setup & installation guide
2. **USER_GUIDE.md** - End-user documentation
3. **API_DOCS.md** - API reference
4. **DEVELOPMENT.md** - Developer setup
5. **CHANGELOG.md** - Version history

---

## 🎓 Future Enhancements

### Short-term (3-6 months)
- Mobile app version
- Inventory management integration
- Automated reports via email
- Custom dashboard widgets

### Long-term (6-12 months)
- Multi-marketplace support (Tokopedia, Lazada)
- AI-powered insights & predictions
- Team collaboration features
- Cloud sync option

---

## 📋 Appendix

### A. Excel Column Mapping
All 49 columns from marketplace export:
1. No. Pesanan
2. Status Pesanan
3. Alasan Pembatalan
4. Status Pembatalan/ Pengembalian
5. No. Resi
6. Opsi Pengiriman
7. Antar ke counter/ pick-up
8. Pesanan Harus Dikirimkan Sebelum
9. Waktu Pengiriman Diatur
10. Waktu Pesanan Dibuat
... (and 39 more)

### B. Status Mapping
```
Marketplace Status → Our Status
"Selesai" → Completed
"Batal" / "Dibatalkan" → Cancelled
"Sedang Dikirim" → Shipped
(Has payment + No resi) → Pending Shipment
```

### C. Color Code for Status
```
Completed: Green (#10B981)
Shipped: Blue (#3B82F6)
Pending: Yellow (#F59E0B)
Cancelled: Red (#EF4444)
```

---

## ✅ Definition of Done

A feature is considered "Done" when:
- ✅ Code is written and follows style guide
- ✅ Unit tests pass
- ✅ Peer review completed
- ✅ No console errors or warnings
- ✅ Responsive on desktop & tablet
- ✅ Animations are smooth (60fps)
- ✅ Documentation updated
- ✅ Tested on Chrome, Firefox, Edge
- ✅ Stakeholder approval

---

**Document Version**: 1.0.0  
**Created**: October 7, 2026  
**Next Review**: End of Phase 1.0
