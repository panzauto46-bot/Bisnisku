# 🏗️ BisnisKu - Project Structure

## 📁 Complete Directory Structure

```
bisnisku/
├── 📄 README.md                      # Project overview & setup guide
├── 📄 PRD.md                         # Product Requirements Document
├── 📄 ROADMAP.md                     # Development roadmap
├── 📄 PROGRESS.md                    # Progress tracking
├── 📄 PROJECT_STRUCTURE.md           # This file
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .eslintrc.json                 # ESLint configuration
├── 📄 .prettierrc                    # Prettier configuration
├── 📄 package.json                   # Dependencies & scripts
├── 📄 pnpm-lock.yaml                 # Lock file
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 next.config.js                 # Next.js configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 drizzle.config.ts              # Drizzle ORM configuration
│
├── 📁 public/                        # Static assets
│   ├── 📁 icons/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── logo-dark.svg
│   ├── 📁 images/
│   │   ├── empty-state.svg
│   │   ├── error-state.svg
│   │   └── upload-placeholder.svg
│   └── 📁 fonts/
│       └── inter-var.woff2
│
├── 📁 src/
│   │
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── 📄 layout.tsx             # Root layout
│   │   ├── 📄 page.tsx               # Homepage (Dashboard)
│   │   ├── 📄 globals.css            # Global styles
│   │   ├── 📄 loading.tsx            # Global loading state
│   │   ├── 📄 error.tsx              # Global error boundary
│   │   ├── 📄 not-found.tsx          # 404 page
│   │   │
│   │   ├── 📁 (dashboard)/           # Dashboard layout group
│   │   │   ├── 📄 layout.tsx         # Dashboard layout with sidebar
│   │   │   │
│   │   │   ├── 📁 dashboard/         # Dashboard page
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 loading.tsx
│   │   │   │
│   │   │   ├── 📁 orders/            # All orders page
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📁 [id]/          # Order detail page
│   │   │   │       └── 📄 page.tsx
│   │   │   │
│   │   │   ├── 📁 pending-shipment/  # Pesanan perlu dikirim
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 loading.tsx
│   │   │   │
│   │   │   ├── 📁 shipped/           # Pesanan dikirim
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 loading.tsx
│   │   │   │
│   │   │   ├── 📁 completed/         # Pesanan selesai
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 loading.tsx
│   │   │   │
│   │   │   ├── 📁 cancelled/         # Pesanan dibatalkan
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 loading.tsx
│   │   │   │
│   │   │   ├── 📁 profit/            # Profit analysis
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📄 loading.tsx
│   │   │   │   └── 📁 products/      # Product cost management
│   │   │   │       └── 📄 page.tsx
│   │   │   │
│   │   │   └── 📁 import/            # Import data page
│   │   │       ├── 📄 page.tsx
│   │   │       └── 📄 loading.tsx
│   │   │
│   │   └── 📁 api/                   # API Routes
│   │       ├── 📁 import/
│   │       │   └── 📄 route.ts       # POST /api/import
│   │       ├── 📁 orders/
│   │       │   ├── 📄 route.ts       # GET /api/orders
│   │       │   └── 📁 [id]/
│   │       │       └── 📄 route.ts   # GET /api/orders/:id
│   │       ├── 📁 stats/
│   │       │   └── 📄 route.ts       # GET /api/stats
│   │       ├── 📁 charts/
│   │       │   ├── 📁 revenue/
│   │       │   │   └── 📄 route.ts
│   │       │   ├── 📁 products/
│   │       │   │   └── 📄 route.ts
│   │       │   └── 📁 status/
│   │       │       └── 📄 route.ts
│   │       ├── 📁 products/
│   │       │   └── 📄 route.ts       # GET/POST /api/products
│   │       └── 📁 profit/
│   │           └── 📄 route.ts       # GET /api/profit
│   │
│   ├── 📁 components/                # React components
│   │   │
│   │   ├── 📁 layout/                # Layout components
│   │   │   ├── 📄 sidebar.tsx
│   │   │   ├── 📄 header.tsx
│   │   │   ├── 📄 breadcrumbs.tsx
│   │   │   ├── 📄 mobile-menu.tsx
│   │   │   └── 📄 footer.tsx
│   │   │
│   │   ├── 📁 dashboard/             # Dashboard components
│   │   │   ├── 📄 metric-card.tsx
│   │   │   ├── 📄 stat-card.tsx
│   │   │   ├── 📄 trend-indicator.tsx
│   │   │   ├── 📄 quick-actions.tsx
│   │   │   └── 📄 recent-orders.tsx
│   │   │
│   │   ├── 📁 charts/                # Chart components
│   │   │   ├── 📄 revenue-chart.tsx
│   │   │   ├── 📄 products-chart.tsx
│   │   │   ├── 📄 status-pie-chart.tsx
│   │   │   ├── 📄 payment-donut-chart.tsx
│   │   │   ├── 📄 profit-area-chart.tsx
│   │   │   └── 📄 chart-container.tsx
│   │   │
│   │   ├── 📁 orders/                # Order components
│   │   │   ├── 📄 orders-table.tsx
│   │   │   ├── 📄 order-row.tsx
│   │   │   ├── 📄 order-detail-modal.tsx
│   │   │   ├── 📄 order-filters.tsx
│   │   │   ├── 📄 status-badge.tsx
│   │   │   ├── 📄 priority-indicator.tsx
│   │   │   └── 📄 bulk-actions.tsx
│   │   │
│   │   ├── 📁 import/                # Import components
│   │   │   ├── 📄 file-upload.tsx
│   │   │   ├── 📄 drag-drop-zone.tsx
│   │   │   ├── 📄 upload-progress.tsx
│   │   │   ├── 📄 import-history.tsx
│   │   │   └── 📄 validation-errors.tsx
│   │   │
│   │   ├── 📁 profit/                # Profit components
│   │   │   ├── 📄 product-cost-table.tsx
│   │   │   ├── 📄 cost-input-form.tsx
│   │   │   ├── 📄 profit-summary.tsx
│   │   │   ├── 📄 performance-report.tsx
│   │   │   └── 📄 roi-calculator.tsx
│   │   │
│   │   ├── 📁 ui/                    # shadcn/ui components
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 dialog.tsx
│   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 select.tsx
│   │   │   ├── 📄 table.tsx
│   │   │   ├── 📄 tabs.tsx
│   │   │   ├── 📄 toast.tsx
│   │   │   ├── 📄 tooltip.tsx
│   │   │   ├── 📄 skeleton.tsx
│   │   │   ├── 📄 badge.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   ├── 📄 slider.tsx
│   │   │   ├── 📄 calendar.tsx
│   │   │   ├── 📄 popover.tsx
│   │   │   ├── 📄 sheet.tsx
│   │   │   └── 📄 progress.tsx
│   │   │
│   │   └── 📁 shared/                # Shared components
│   │       ├── 📄 loading-spinner.tsx
│   │       ├── 📄 error-message.tsx
│   │       ├── 📄 empty-state.tsx
│   │       ├── 📄 search-input.tsx
│   │       ├── 📄 date-range-picker.tsx
│   │       ├── 📄 pagination.tsx
│   │       ├── 📄 copy-button.tsx
│   │       └── 📄 animated-counter.tsx
│   │
│   ├── 📁 lib/                       # Utility libraries
│   │   ├── 📄 utils.ts               # General utilities
│   │   ├── 📄 cn.ts                  # className utility
│   │   ├── 📄 constants.ts           # App constants
│   │   ├── 📄 validations.ts         # Zod schemas
│   │   └── 📄 api-client.ts          # API client wrapper
│   │
│   ├── 📁 db/                        # Database layer
│   │   ├── 📄 index.ts               # Database instance
│   │   ├── 📄 schema.ts              # Drizzle schema
│   │   ├── 📄 migrations.ts          # Migration runner
│   │   └── 📁 queries/               # Database queries
│   │       ├── 📄 orders.ts
│   │       ├── 📄 products.ts
│   │       ├── 📄 stats.ts
│   │       └── 📄 imports.ts
│   │
│   ├── 📁 services/                  # Business logic
│   │   ├── 📄 excel-parser.service.ts
│   │   ├── 📄 order.service.ts
│   │   ├── 📄 profit.service.ts
│   │   ├── 📄 statistics.service.ts
│   │   └── 📄 export.service.ts
│   │
│   ├── 📁 hooks/                     # Custom React hooks
│   │   ├── 📄 use-orders.ts
│   │   ├── 📄 use-filters.ts
│   │   ├── 📄 use-pagination.ts
│   │   ├── 📄 use-debounce.ts
│   │   ├── 📄 use-stats.ts
│   │   ├── 📄 use-upload.ts
│   │   └── 📄 use-profit.ts
│   │
│   ├── 📁 store/                     # State management
│   │   ├── 📄 filters-store.ts       # Zustand store for filters
│   │   ├── 📄 ui-store.ts            # UI state (sidebar, modals)
│   │   └── 📄 user-store.ts          # User preferences
│   │
│   ├── 📁 types/                     # TypeScript types
│   │   ├── 📄 order.types.ts
│   │   ├── 📄 product.types.ts
│   │   ├── 📄 api.types.ts
│   │   ├── 📄 chart.types.ts
│   │   └── 📄 database.types.ts
│   │
│   └── 📁 utils/                     # Helper functions
│       ├── 📄 format.ts              # Formatting utilities
│       ├── 📄 date.ts                # Date utilities
│       ├── 📄 currency.ts            # Currency formatting
│       ├── 📄 excel.ts               # Excel helpers
│       ├── 📄 filters.ts             # Filter logic
│       └── 📄 calculations.ts        # Profit calculations
│
├── 📁 data/                          # Local data storage
│   ├── 📄 database.db                # SQLite database (gitignored)
│   ├── 📁 uploads/                   # Uploaded files (gitignored)
│   └── 📁 exports/                   # Generated exports (gitignored)
│
├── 📁 tests/                         # Test files
│   ├── 📁 unit/
│   │   ├── 📄 format.test.ts
│   │   ├── 📄 calculations.test.ts
│   │   └── 📄 excel-parser.test.ts
│   ├── 📁 integration/
│   │   ├── 📄 api.test.ts
│   │   └── 📄 database.test.ts
│   └── 📁 e2e/
│       ├── 📄 import.spec.ts
│       └── 📄 orders.spec.ts
│
├── 📁 docs/                          # Additional documentation
│   ├── 📄 USER_GUIDE.md
│   ├── 📄 API_DOCS.md
│   ├── 📄 DEVELOPMENT.md
│   ├── 📄 DEPLOYMENT.md
│   └── 📁 screenshots/
│       ├── dashboard.png
│       ├── orders-page.png
│       └── import-flow.png
│
└── 📁 scripts/                       # Utility scripts
    ├── 📄 setup-db.ts                # Initialize database
    ├── 📄 seed-demo.ts               # Seed demo data
    ├── 📄 migrate.ts                 # Run migrations
    └── 📄 backup-db.ts               # Backup database
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed-demo.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔧 Core Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    
    "@radix-ui/react-*": "*",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    
    "framer-motion": "^11.2.0",
    
    "recharts": "^2.12.0",
    
    "@tanstack/react-table": "^8.17.0",
    
    "better-sqlite3": "^10.0.0",
    "drizzle-orm": "^0.31.0",
    
    "xlsx": "^0.18.5",
    "exceljs": "^4.4.0",
    
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    
    "zustand": "^4.5.0",
    
    "date-fns": "^3.6.0",
    "react-day-picker": "^8.10.0",
    
    "sonner": "^1.5.0",
    "vaul": "^0.9.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/better-sqlite3": "^7.6.10",
    
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    
    "drizzle-kit": "^0.22.0",
    
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    
    "tsx": "^4.15.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0"
  }
}
```

---

## 🎨 File Naming Conventions

### General Rules
- **Components**: PascalCase with `.tsx` extension
  - Example: `MetricCard.tsx`, `OrdersTable.tsx`
  
- **Pages**: kebab-case folders, `page.tsx` file
  - Example: `pending-shipment/page.tsx`
  
- **Utilities**: camelCase with `.ts` extension
  - Example: `formatCurrency.ts`, `dateHelpers.ts`
  
- **Types**: PascalCase with `.types.ts` suffix
  - Example: `Order.types.ts`, `Api.types.ts`
  
- **Hooks**: camelCase with `use-` prefix
  - Example: `use-orders.ts`, `use-filters.ts`
  
- **Services**: camelCase with `.service.ts` suffix
  - Example: `excel-parser.service.ts`

---

## 📋 Component Organization Pattern

### Standard Component Structure

```tsx
// components/dashboard/metric-card.tsx

'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

// Types
interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: number
  loading?: boolean
}

// Component
export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  loading 
}: MetricCardProps) {
  // Hooks
  
  // Handlers
  
  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        {/* Content */}
      </Card>
    </motion.div>
  )
}
```

---

## 🗄️ Database Structure

### SQLite Database Location
```
data/database.db
```

### Tables Overview

1. **orders** - Main orders table (49+ columns)
2. **products** - Product cost management
3. **import_history** - Track imports
4. **user_preferences** - User settings (future)

---

## 🔌 API Route Structure

### Standard API Route Pattern

```typescript
// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ordersService } from '@/services/order.service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    const orders = await ordersService.getOrders({ status })
    
    return NextResponse.json({ 
      success: true, 
      data: orders 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Code Organization Principles

### 1. Separation of Concerns
- **Components**: Only UI logic
- **Services**: Business logic
- **Hooks**: Reusable stateful logic
- **Utils**: Pure functions

### 2. Co-location
- Keep related files close together
- Group by feature, not by file type

### 3. DRY (Don't Repeat Yourself)
- Reusable components in `/components/shared`
- Utility functions in `/utils`
- Common types in `/types`

### 4. Single Responsibility
- Each file has one clear purpose
- Components do one thing well

---

## 🔒 Environment Variables

```env
# .env.local (not committed to git)

NEXT_PUBLIC_APP_NAME=ShopeeFlow
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database
DATABASE_PATH=./data/database.db

# Upload limits
MAX_FILE_SIZE=52428800  # 50MB
MAX_ROWS_PER_IMPORT=10000

# Development
NODE_ENV=development
```

---

## 📚 Import Alias Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./utils/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/services/*": ["./services/*"],
      "@/db/*": ["./db/*"]
    }
  }
}
```

### Usage Example
```typescript
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/format'
import { useOrders } from '@/hooks/use-orders'
import type { Order } from '@/types/order.types'
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Usage
```tsx
// ✅ Good: Semantic, readable
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">
  <Icon className="h-5 w-5 text-blue-500" />
  <span className="text-sm font-medium text-gray-700">{title}</span>
</div>

// ❌ Avoid: Too many classes, hard to read
<div className="flex flex-row items-center justify-start gap-x-4 gap-y-0 px-6 py-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
```

### Component Variants (CVA)
```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border border-gray-300 bg-transparent',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)
```

---

## 🧪 Testing Structure

### Unit Test Example
```typescript
// tests/unit/format.test.ts

import { formatCurrency, formatDate } from '@/utils/format'

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format Indonesian Rupiah correctly', () => {
      expect(formatCurrency(100000)).toBe('Rp 100.000')
    })
  })
})
```

---

## 📖 Documentation Standards

### Component Documentation
```typescript
/**
 * MetricCard - Displays a key metric with optional trend indicator
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Orders"
 *   value={679}
 *   icon={PackageIcon}
 *   trend={12.5}
 * />
 * ```
 */
export function MetricCard({ ... }) { ... }
```

---

## 🚀 Build & Deployment

### Development Build
```bash
pnpm dev
# Runs on http://localhost:3000
```

### Production Build
```bash
pnpm build
pnpm start
```

### Standalone Build (for Desktop)
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
}
```

---

## 📝 Git Workflow

### Branch Naming
- `feature/orders-table` - New features
- `fix/import-bug` - Bug fixes
- `refactor/db-queries` - Refactoring
- `docs/api-documentation` - Documentation

### Commit Messages
```
feat: add order detail modal
fix: resolve import validation issue
refactor: optimize database queries
docs: update API documentation
style: format code with prettier
test: add unit tests for calculations
```

---

## 🎯 Best Practices Summary

1. ✅ Use TypeScript strictly
2. ✅ Follow component structure pattern
3. ✅ Keep components small and focused
4. ✅ Use custom hooks for reusable logic
5. ✅ Implement proper error boundaries
6. ✅ Add loading states everywhere
7. ✅ Write meaningful comments
8. ✅ Test critical business logic
9. ✅ Optimize for performance (React.memo, useMemo)
10. ✅ Keep dependencies updated

---

**Document Version**: 1.0.0  
**Last Updated**: October 7, 2026
