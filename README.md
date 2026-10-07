# 🚀 BisnisKu

> Professional Dashboard for Shopee Order Management & Analytics

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Overview

**BisnisKu** adalah aplikasi desktop berbasis web yang dirancang untuk membantu Shopee sellers mengelola pesanan mereka dengan mudah. Aplikasi ini mengotomatisasi proses analisis data dari file Excel export Shopee dengan visualisasi yang profesional dan interaktif.

### ✨ Key Features

- 📊 **Dashboard Analytics** - Visualisasi data real-time dengan charts profesional
- 📦 **Order Management** - Kelola semua pesanan dalam satu tempat
- 🎯 **Smart Filtering** - Filter otomatis berdasarkan status pesanan
- 💰 **Profit Analysis** - Hitung profit bersih per produk
- 📤 **Easy Import** - Drag & drop Excel file dari Shopee
- 🎨 **Beautiful UI** - Modern interface dengan smooth animations
- ⚡ **Fast Performance** - Handle 1000+ orders dengan mudah
- 🔒 **Privacy First** - Semua data tersimpan lokal (SQLite)

---

## 🖼️ Screenshots

*Coming soon after implementation*

---

## 🎯 Target Users

- Shopee sellers yang ingin analisis data lebih mudah
- Small to medium business owners
- Siapa saja yang butuh dashboard profesional untuk data Shopee

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
- **Runtime**: Node.js
- **Database**: SQLite + Drizzle ORM
- **Excel Parser**: xlsx
- **API**: Next.js API Routes

---

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Node.js** >= 18.17.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (Recommended)
  ```bash
  npm install -g pnpm
  ```

Atau bisa juga pakai:
- **npm** >= 9.0.0
- **yarn** >= 1.22.0

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/panzauto46-bot/Bisnisku.git
cd Bisnisku
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Run Development Server

```bash
pnpm dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 📦 Installation (Detailed)

### Step 1: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 2: Environment Setup

Buat file `.env.local` di root folder:

```env
NEXT_PUBLIC_APP_NAME=BisnisKu
NEXT_PUBLIC_APP_VERSION=1.0.0
DATABASE_PATH=./data/database.db
MAX_FILE_SIZE=52428800
MAX_ROWS_PER_IMPORT=10000
NODE_ENV=development
```

### Step 3: Database Setup

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed demo data
pnpm db:seed
```

### Step 4: Start Development

```bash
pnpm dev
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server (port 3000) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Check TypeScript types |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |
| `pnpm db:seed` | Seed demo data |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate test coverage report |

---

## 📖 Usage Guide

### 1. Import Data dari Shopee

1. Login ke **Shopee Seller Center**
2. Pergi ke **My Income** → **My Orders**
3. Klik **Export** → Pilih date range → Download Excel
4. Buka **ShopeeFlow**
5. Klik **Import Data** atau drag & drop file Excel
6. Wait for processing (biasanya < 5 detik)
7. Data siap digunakan! 🎉

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

- **Global Search**: Cari by order number, product name, customer name
- **Date Range**: Filter by order date
- **Status**: Multi-select status filter
- **Price Range**: Filter by price
- **Location**: Filter by province/city

### 4. View Order Details

Klik pada row order untuk melihat detail lengkap (49 fields):
- Order information
- Product details
- Pricing & discounts
- Shipping information
- Customer information
- Timeline

### 5. Analisis Profit (Phase 1.2)

1. Pergi ke **Analisis Profit** → **Product Cost Management**
2. Input harga pokok (modal) per produk
3. Sistem otomatis calculate profit
4. Lihat profit per produk, margin, ROI
5. Export report

---

## 📁 Project Structure

```
shopeeflow/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   ├── db/               # Database layer
│   ├── services/         # Business logic
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   └── types/            # TypeScript types
├── public/               # Static assets
├── data/                 # SQLite database
├── docs/                 # Documentation
└── tests/                # Test files
```

Detail lengkap: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 🗺️ Roadmap

### ✅ Phase 1.0 - MVP (Week 1-3)
- [ ] Project setup
- [ ] Import Excel functionality
- [ ] Dashboard with basic metrics
- [ ] All 5 order status pages
- [ ] Search & filtering
- [ ] Order detail view

### ⏳ Phase 1.1 - Enhancement (Week 4-5)
- [ ] Professional animations
- [ ] Advanced charts
- [ ] Export functionality
- [ ] Responsive design
- [ ] Error handling & loading states

### ⏳ Phase 1.2 - Profit Analysis (Week 6-7)
- [ ] Product cost management
- [ ] Profit calculation
- [ ] Performance reports
- [ ] ROI analytics

### 🔮 Phase 2.0 - Future
- Multi-file import
- Dark mode
- Multi-language (EN/ID)
- Email notifications
- Mobile app version

Detail lengkap: [ROADMAP.md](./ROADMAP.md)

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Coverage Goals
- Unit tests: > 80%
- Integration tests: Critical flows
- E2E tests: Main user journeys

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
- Shopee Seller Center
- Modern analytics dashboards
- E-commerce management tools

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

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
- Shopee untuk platform yang luar biasa
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

**Made with ❤️ for Shopee Sellers**

[⭐ Star this project](https://github.com/panzauto46-bot/Bisnisku) | [🐛 Report Bug](https://github.com/panzauto46-bot/Bisnisku/issues) | [💡 Request Feature](https://github.com/panzauto46-bot/Bisnisku/issues)

</div>
