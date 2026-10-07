'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Percent,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ExportMenu } from '@/components/dashboard/export-menu'
import { DiscountBreakdownCard } from '@/components/dashboard/discount-breakdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/format'
import type { DashboardStats } from '@/types/order.types'
import { StatusDistributionChart } from '@/components/charts/status-chart'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { PaymentMethodChart } from '@/components/charts/payment-chart'
import { TopProductsChart } from '@/components/charts/top-products-chart'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-slate-400">Memuat dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan performa toko Anda
          </p>
        </div>
        <ExportMenu />
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Semua Pesanan"
          value={stats.total}
          icon={Package}
          color="slate"
          index={0}
        />
        <MetricCard
          title="Perlu Dikirim"
          value={stats.pending}
          icon={Clock}
          color="amber"
          index={1}
        />
        <MetricCard
          title="Dikirim"
          value={stats.shipped}
          icon={Truck}
          color="blue"
          index={2}
        />
        <MetricCard
          title="Selesai"
          value={stats.completed}
          icon={CheckCircle2}
          color="emerald"
          index={3}
        />
        <MetricCard
          title="Dibatalkan"
          value={stats.cancelled}
          icon={XCircle}
          color="red"
          index={4}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pendapatan"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="emerald"
          format={formatCurrency}
          index={5}
        />
        <MetricCard
          title="Rata-rata per Pesanan"
          value={stats.averageOrderValue}
          icon={TrendingUp}
          color="blue"
          format={formatCurrency}
          index={6}
        />
        <MetricCard
          title="Total Diskon"
          value={stats.totalDiscount}
          icon={Percent}
          color="amber"
          format={formatCurrency}
          index={7}
        />
        <MetricCard
          title="Total Ongkir"
          value={stats.totalShipping}
          icon={Truck}
          color="slate"
          format={formatCurrency}
          index={8}
        />
      </div>

      {/* Discount & shipping breakdown — full transparency on every
          deduction component the platform applies */}
      <DiscountBreakdownCard
        discount={stats.discountBreakdown}
        shipping={stats.shippingBreakdown}
        completedCount={stats.completed}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <StatusDistributionChart
          stats={{
            pending: stats.pending,
            shipped: stats.shipped,
            completed: stats.completed,
            cancelled: stats.cancelled,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductsChart />
        <PaymentMethodChart />
      </div>

      {/* Rate Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tingkat Penyelesaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.3,
                      ease: 'easeOut',
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-emerald-600">
                {formatPercentage(stats.completionRate)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(stats.completed)} dari {formatNumber(stats.total)}{' '}
              pesanan selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tingkat Pembatalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.cancellationRate}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.4,
                      ease: 'easeOut',
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600"
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-red-600">
                {formatPercentage(stats.cancellationRate)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(stats.cancelled)} dari {formatNumber(stats.total)}{' '}
              pesanan dibatalkan
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
