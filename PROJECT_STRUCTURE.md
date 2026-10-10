# 🏗️ BisnisKu - Project Structure

## 📁 Complete Directory Structure

```
BisnisKu/
├── 📄 README.md                      # Project overview & setup guide
├── 📄 PRD.md                         # Product Requirements Document
├── 📄 ROADMAP.md                     # Development roadmap
├── 📄 PROGRESS.md                    # Progress tracking
├── 📄 STATUS.md                      # Current status
├── 📄 CHANGELOG.md                   # Changelog
├── 📄 SUMMARY.md                     # Project summary
├── 📄 PROJECT_STRUCTURE.md           # This file
├── 📄 LICENSE                        # MIT license
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .eslintrc.json                 # ESLint configuration
├── 📄 .prettierrc                    # Prettier configuration
├── 📄 package.json                   # Dependencies & scripts
├── 📄 package-lock.json              # Lock file
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 next.config.js                 # Next.js configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 components.json                # shadcn/ui configuration
├── 📄 drizzle.config.ts              # Drizzle ORM configuration
│
├── 📁 app/                           # Next.js App Router (root, no src/)
│   ├── 📄 layout.tsx                 # Root layout + metadata
│   ├── 📄 page.tsx                   # Dashboard (homepage)
│   ├── 📄 globals.css                # Global styles
│   │
│   ├── 📁 api/                       # API routes (route handlers)
│   │   ├── 📁 charts/
│   │   │   ├── 📁 revenue/
│   │   │   │   └── 📄 route.ts       # Daily revenue trend
│   │   │   ├── 📁 products/
│   │   │   │   └── 📄 route.ts       # Top products
│   │   │   └── 📁 payment-methods/
│   │   │       └── 📄 route.ts       # Payment method breakdown
│   │   ├── 📁 import/
│   │   │   └── 📄 route.ts           # Order Excel upload endpoint
│   │   ├── 📁 import-earnings/
│   │   │   └── 📄 route.ts           # Settlement Excel upload endpoint
│   │   ├── 📁 orders/
│   │   │   ├── 📄 route.ts           # List w/ filters & pagination
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 route.ts       # Single order detail
│   │   ├── 📁 products/
│   │   │   └── 📄 route.ts           # Product cost management
│   │   ├── 📁 profit/
│   │   │   └── 📄 route.ts           # Profit analysis
│   │   ├── 📁 earnings/
│   │   │   ├── 📄 route.ts           # Aggregate earnings stats
│   │   │   └── 📁 [orderNumber]/
│   │   │       └── 📄 route.ts       # Per-order earnings
│   │   ├── 📁 reset/
│   │   │   └── 📄 route.ts           # DELETE all data
│   │   ├── 📁 export/
│   │   │   └── 📄 route.ts           # CSV / Excel / PDF export
│   │   └── 📁 stats/
│   │       └── 📄 route.ts           # Dashboard metrics
│   │
│   ├── 📁 orders/                    # All orders page
│   │   └── 📄 page.tsx
│   ├── 📁 pending/                   # Perlu Dikirim page
│   │   └── 📄 page.tsx
│   ├── 📁 shipped/                   # Dikirim page
│   │   └── 📄 page.tsx
│   ├── 📁 completed/                 # Selesai page
│   │   └── 📄 page.tsx
│   ├── 📁 cancelled/                 # Dibatalkan page
│   │   └── 📄 page.tsx
│   ├── 📁 import/                    # Import page (2 upload zones + reset)
│   │   └── 📄 page.tsx
│   └── 📁 profit/                    # Profit analysis page
│       └── 📄 page.tsx
│
├── 📁 components/                    # React components
│   ├── 📁 charts/                    # Recharts wrappers
│   │   ├── 📄 revenue-chart.tsx
│   │   ├── 📄 status-chart.tsx
│   │   ├── 📄 top-products-chart.tsx
│   │   └── 📄 payment-chart.tsx
│   ├── 📁 dashboard/                 # Dashboard widgets
│   │   ├── 📄 metric-card.tsx
│   │   ├── 📄 export-menu.tsx        # CSV/Excel/PDF dropdown (9 opsi)
│   │   ├── 📄 discount-breakdown.tsx # Rincian potongan platform
│   │   └── 📄 earnings-panel.tsx     # Panel Penghasilan Bersih Platform
│   ├── 📁 import/                    # Upload building blocks
│   │   └── 📄 file-upload-zone.tsx   # Reusable drag & drop zone
│   ├── 📁 layout/                    # App chrome
│   │   ├── 📄 header.tsx
│   │   └── 📄 sidebar.tsx
│   ├── 📁 orders/                    # Order UI
│   │   ├── 📄 orders-table.tsx       # Table + pagination + search + badge penghasilan
│   │   ├── 📄 order-detail-modal.tsx # 49-field detail modal
│   │   └── 📄 earnings-detail-section.tsx # Rincian Penghasilan gaya marketplace
│   ├── 📁 shared/                    # Shared building blocks
│   │   ├── 📄 animated-counter.tsx
│   │   ├── 📄 status-badge.tsx
│   │   └── 📄 confirm-dialog.tsx     # Konfirmasi dialog (reset)
│   └── 📁 ui/                        # Base UI (button, card)
│       ├── 📄 button.tsx
│       └── 📄 card.tsx
│
├── 📁 lib/                           # License logic
│   ├── 📄 license.ts                 # Session cookie sign/verify (Web Crypto, Edge-safe)
│   ├── 📄 license-file.ts            # Ed25519 license file verification (nodejs)
│   └── 📄 license-client.ts          # Browser device fingerprint
│
├── 📁 db/                            # Database layer
│   ├── 📄 index.ts                   # libSQL/Turso + Drizzle singleton
│   └── 📄 schema.ts                  # orders, products, order_earnings, import_history, license_activations
│
├── 📁 services/                      # Business logic
│   ├── 📄 excel-parser.service.ts    # Order Excel adapter (headers → RawOrder)
│   ├── 📄 earnings-parser.service.ts # Settlement Excel adapter (Penghasilan sheet)
│   ├── 📄 order.service.ts           # Queries, status mapping, stats, reset
│   ├── 📄 earnings.service.ts        # Upsert + aggregate earnings
│   ├── 📄 profit.service.ts          # Profit calculation engine
│   └── 📄 export.service.ts          # CSV / Excel / PDF generators
│
├── 📁 utils/                         # Helpers
│   ├── 📄 format.ts                  # Currency / number formatting
│   └── 📄 date.ts                    # Date parsing (marketplace format)
│
├── 📁 types/                         # TypeScript types
│   ├── 📄 order.types.ts             # RawOrder, Order, OrderStatus, stats
│   └── 📄 earnings.types.ts          # RawEarnings, OrderEarnings, EarningsStats
│
├── 📁 scripts/                       # CLI utilities
│   ├── 📄 setup-db.ts                # Initialize database (local file or Turso)
│   ├── 📄 generate-license.ts        # License generator (seller tool)
│   ├── 📄 import-excel.ts            # Import Excel export
│   ├── 📄 verify-data.ts             # Verify imported data
│   ├── 📄 check-statuses.ts          # Inspect raw status strings
│   └── 📄 check-category.ts          # Inspect status categories
│
├── 📄 Generator-License.bat          # Double-click launcher for license generator
├── 📄 middleware.ts                  # Edge middleware: route guard by cookie
│
├── 📁 public/                        # Static assets
│
└── 📁 data/                          # Local storage (gitignored)
    ├── 📄 database.db                # SQLite database (development only)
    ├── 📄 license-private.key        # Ed25519 private key (RAHASIA, seller only)
    └── 📄 license-public.key         # Ed25519 public key (ditanam di app)
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
    "db:setup": "tsx scripts/setup-db.ts",
    "license:gen": "tsx scripts/generate-license.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
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

    "@libsql/client": "^0.14.0",
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

NEXT_PUBLIC_APP_NAME=BisnisKu
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

**Document Version**: 1.0.1  
**Last Updated**: October 10, 2026
