'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Package,
  AlertCircle,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/format'
import type { ProductPerformance } from '@/types/order.types'

interface ProfitStats {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  productsAnalyzed: number
  productsWithCost: number
  bestProduct: ProductPerformance | null
  worstProduct: ProductPerformance | null
}

interface ProductWithCost {
  id: number | null
  productName: string
  costPrice: number | null
}

export default function ProfitPage() {
  const [stats, setStats] = useState<ProfitStats | null>(null)
  const [performance, setPerformance] = useState<ProductPerformance[]>([])
  const [productList, setProductList] = useState<ProductWithCost[]>([])
  const [loading, setLoading] = useState(true)
  const [costInputs, setCostInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profitRes, productsRes] = await Promise.all([
        fetch('/api/profit'),
        fetch('/api/products'),
      ])

      const profitData = await profitRes.json()
      const productsData = await productsRes.json()

      if (profitData.success) {
        setStats(profitData.data.stats)
        setPerformance(profitData.data.performance)
      }

      if (productsData.success) {
        setProductList(productsData.data)
        // Pre-fill cost inputs
        const inputs: Record<string, string> = {}
        productsData.data.forEach((p: ProductWithCost) => {
          if (p.costPrice !== null) {
            inputs[p.productName] = String(p.costPrice)
          }
        })
        setCostInputs(inputs)
      }
    } catch (error) {
      console.error('Error fetching profit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCost = async (productName: string) => {
    const costValue = costInputs[productName]

    if (costValue === undefined || costValue === '') {
      toast.error('Masukkan harga modal terlebih dahulu')
      return
    }

    const cost = parseFloat(costValue)
    if (isNaN(cost) || cost < 0) {
      toast.error('Harga modal tidak valid')
      return
    }

    setSaving(productName)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, costPrice: cost }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Modal ${productName.substring(0, 30)}... disimpan`)
        fetchData() // Refresh data
      } else {
        toast.error(data.error || 'Gagal menyimpan')
      }
    } catch (error) {
      toast.error('Gagal menyimpan harga modal')
    } finally {
      setSaving(null)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-slate-400">Memuat data profit...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analisis Profit</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hitung keuntungan bersih per produk berdasarkan modal
        </p>
      </div>

      {/* Warning if no costs set */}
      {stats.productsWithCost === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Belum ada harga modal yang diisi
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Isi harga modal (cost price) pada tabel di bawah untuk
              menghitung profit. Saat ini profit dihitung dengan modal Rp 0.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfitCard
          title="Total Pendapatan"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="blue"
          index={0}
        />
        <ProfitCard
          title="Total Modal"
          value={stats.totalCost}
          icon={Package}
          color="slate"
          index={1}
        />
        <ProfitCard
          title="Total Profit"
          value={stats.totalProfit}
          icon={stats.totalProfit >= 0 ? TrendingUp : TrendingDown}
          color={stats.totalProfit >= 0 ? 'emerald' : 'red'}
          index={2}
        />
        <ProfitCard
          title="Margin Profit"
          value={stats.profitMargin}
          icon={Percent}
          color={stats.profitMargin >= 0 ? 'emerald' : 'red'}
          isPercentage
          index={3}
        />
      </div>

      {/* Product Cost Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kelola Harga Modal</CardTitle>
          <p className="text-sm text-slate-500">
            {stats.productsWithCost} dari {stats.productsAnalyzed} produk
            sudah memiliki harga modal
          </p>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Nama Produk
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Harga Modal
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productList.map((product, index) => (
                  <tr key={product.productName} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="max-w-[400px]">
                        <p className="truncate font-medium text-slate-900">
                          {product.productName}
                        </p>
                        {product.costPrice !== null && (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-emerald-600">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Modal sudah diisi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Rp</span>
                        <input
                          type="number"
                          value={costInputs[product.productName] || ''}
                          onChange={(e) =>
                            setCostInputs({
                              ...costInputs,
                              [product.productName]: e.target.value,
                            })
                          }
                          placeholder="0"
                          className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveCost(product.productName)}
                        disabled={saving === product.productName}
                      >
                        {saving === product.productName ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            Simpan
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Laporan Performa Produk</CardTitle>
          <p className="text-sm text-slate-500">
            Diurutkan berdasarkan profit tertinggi
          </p>
        </CardHeader>
        <CardContent>
          {performance.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-slate-400">
              Belum ada data performa
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Terjual
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Pendapatan
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Modal
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Profit
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.map((item, index) => (
                    <motion.tr
                      key={item.productName}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="max-w-[250px]">
                          <p className="truncate font-medium text-slate-900">
                            {item.productName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatNumber(item.unitsSold)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            item.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(item.profit)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.margin >= 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {formatPercentage(item.margin)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfitCard({
  title,
  value,
  icon: Icon,
  color,
  isPercentage = false,
  index = 0,
}: {
  title: string
  value: number
  icon: any
  color: 'blue' | 'emerald' | 'red' | 'slate'
  isPercentage?: boolean
  index?: number
}) {
  const colorConfig = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
  }

  const config = colorConfig[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="mt-2">
              <AnimatedCounter
                value={value}
                format={
                  isPercentage
                    ? (v) => formatPercentage(v)
                    : (v) => formatCurrency(v)
                }
                className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums"
              />
            </div>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.bg}`}
          >
            <Icon className={`h-5 w-5 ${config.text}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
