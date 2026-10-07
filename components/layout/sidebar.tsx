'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Upload,
  TrendingUp,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & analytics',
  },
  {
    title: 'Semua Pesanan',
    href: '/orders',
    icon: Package,
    description: 'Lihat semua pesanan',
  },
  {
    title: 'Perlu Dikirim',
    href: '/pending',
    icon: Clock,
    description: 'Pesanan menunggu dikirim',
  },
  {
    title: 'Dikirim',
    href: '/shipped',
    icon: Truck,
    description: 'Pesanan dalam pengiriman',
  },
  {
    title: 'Selesai',
    href: '/completed',
    icon: CheckCircle2,
    description: 'Pesanan selesai',
  },
  {
    title: 'Dibatalkan',
    href: '/cancelled',
    icon: XCircle,
    description: 'Pesanan dibatalkan',
  },
  {
    title: 'Analisis Profit',
    href: '/profit',
    icon: TrendingUp,
    description: 'Hitung keuntungan',
  },
  {
    title: 'Import Data',
    href: '/import',
    icon: Upload,
    description: 'Upload file Excel',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">BisnisKu</h1>
          <p className="text-xs text-slate-500">Shopee Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item, index) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.2,
                delay: index * 0.04,
                ease: 'easeOut',
              }}
            >
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs font-normal text-slate-400">
                    {item.description}
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
          <p className="text-xs font-medium text-blue-700">BisnisKu v1.0.0</p>
          <p className="mt-1 text-xs text-slate-500">
            Professional Dashboard
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
