'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  category: 'all' | 'pending' | 'shipped' | 'completed' | 'cancelled'
  label?: string
  className?: string
}

const statusConfig = {
  all: {
    label: 'Semua',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dot: 'bg-slate-500',
  },
  pending: {
    label: 'Perlu Dikirim',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  shipped: {
    label: 'Dikirim',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
  },
}

export function StatusBadge({ category, label, className }: StatusBadgeProps) {
  const config = statusConfig[category]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {label || config.label}
    </motion.span>
  )
}
