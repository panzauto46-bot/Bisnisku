'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number
  icon: LucideIcon
  format?: (value: number) => string
  color?: 'blue' | 'amber' | 'emerald' | 'red' | 'slate'
  index?: number
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/30',
    glow: 'group-hover:shadow-blue-500/40',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/30',
    glow: 'group-hover:shadow-amber-500/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/30',
    glow: 'group-hover:shadow-emerald-500/40',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    shadow: 'shadow-red-500/30',
    glow: 'group-hover:shadow-red-500/40',
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    gradient: 'from-slate-500 to-slate-600',
    shadow: 'shadow-slate-500/30',
    glow: 'group-hover:shadow-slate-500/40',
  },
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  format,
  color = 'blue',
  index = 0,
}: MetricCardProps) {
  const config = colorConfig[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="relative overflow-hidden p-5">
        {/* Gradient glow effect on hover */}
        <div
          className={cn(
            'absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20',
            config.gradient
          )}
        />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="mt-2">
              <AnimatedCounter
                value={value}
                format={format}
                className={cn(
                  'text-2xl font-bold tracking-tight text-slate-900',
                  'tabular-nums'
                )}
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl shadow-lg',
              config.bg,
              config.shadow,
              config.glow
            )}
          >
            <Icon className={cn('h-5 w-5', config.text)} />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
