'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Upload, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'
import type { EarningsStats } from '@/types/earnings.types'

export function EarningsPanel() {
  const [stats, setStats] = useState<EarningsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/earnings')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching earnings stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // No settlement file imported yet — show a prompt instead of zeros
  if (!loading && !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Belum ada data penghasilan
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Import file <strong>Laporan Penghasilan</strong> dari Seller
                Center untuk melihat penghasilan bersih dan semua biaya platform
                yang dipotong.
              </p>
            </div>
            <Link
              href="/import"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Import File Penghasilan
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading || !stats) {
    return (
      <Card className="p-6">
        <div className="animate-pulse text-slate-400">Memuat penghasilan...</div>
      </Card>
    )
  }

  const platformFeeRows: { label: string; value: number }[] = [
    { label: 'Biaya Administrasi', value: stats.totalAdminFee },
    { label: 'Biaya Proses Pesanan', value: stats.totalOrderProcessFee },
    { label: 'Biaya Transaksi', value: stats.totalTransactionFee },
    { label: 'Biaya Layanan Promo XTRA+', value: stats.totalServiceFeePromoXtra },
    { label: 'Biaya Gratis Ongkir XTRA', value: stats.totalFreeShippingXtraFee },
    { label: 'Biaya Kampanye', value: stats.totalCampaignFee },
    { label: 'Biaya Komisi AMS', value: stats.totalAmsCommissionFee },
    { label: 'Biaya Isi Saldo Otomatis', value: stats.totalAutoTopupFee },
    { label: 'Premi', value: stats.totalPremium },
    { label: 'FBS Fee', value: stats.totalFbsFee },
    { label: 'PPh 22', value: stats.totalPph22 },
  ]

  const shippingRows: { label: string; value: number }[] = [
    {
      label: 'Ongkir Dibayar Pembeli',
      value: stats.totalShippingPaidByBuyer,
    },
    {
      label: 'Ongkir Dibayarkan ke Jasa Kirim',
      value: stats.totalShippingPaidToCourier,
    },
    {
      label: 'Gratis Ongkir dari Platform',
      value: stats.totalFreeShippingFromPlatform,
    },
    {
      label: 'Ongkir Pengembalian',
      value: stats.totalReturnShippingFee,
    },
    {
      label: 'Pengembalian Biaya Kirim',
      value: stats.totalShippingCostRefund,
    },
  ]

  const sellerRows: { label: string; value: number }[] = [
    { label: 'Voucher Disponsor Penjual', value: stats.totalSellerSponsoredVoucher },
    {
      label: 'Cashback Koin Disponsor Penjual',
      value: stats.totalSellerSponsoredCoinCashback,
    },
    { label: 'Diskon Produk dari Platform', value: stats.totalPlatformProductDiscount },
    { label: 'Voucher Co-fund', value: stats.totalCoFundVoucher },
    { label: 'Cashback Koin Co-fund', value: stats.totalCoFundCoinCashback },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-transparent">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4.5 w-4.5 text-emerald-600" />
            Penghasilan Bersih Platform
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Dari <span className="font-medium text-slate-700">
              {stats.rowCount} baris settlement
            </span>{' '}
            di file Laporan Penghasilan
            {stats.unmatchedCount > 0 && (
              <>
                {' '}—{' '}
                <span className="text-amber-600">
                  {stats.unmatchedCount} order belum ada di data pesanan
                </span>
              </>
            )}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Headline number */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Total Penghasilan Bersih
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-700">
                {formatCurrency(stats.totalEarnings)}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-600">
                Yang masuk ke saldo penjual
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Total Harga Produk
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">
                {formatCurrency(stats.totalProductPrice)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Sebelum dipotong biaya
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                Total Biaya Platform
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-red-600">
                {formatCurrency(stats.totalPlatformFees)}
              </p>
              <p className="mt-0.5 text-[11px] text-red-500">
                {stats.totalProductPrice > 0
                  ? `${((stats.totalPlatformFees / stats.totalProductPrice) * 100).toFixed(1)}% dari harga produk`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-3">
            {/* Platform fees */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Biaya Platform
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">
                Semua potongan yang dikenakan platform
              </p>
              <div className="mt-2.5 space-y-1.5">
                {platformFeeRows.map((row) => (
                  <FeeRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-4 border-t border-slate-300 pt-2.5 text-sm">
                <span className="font-semibold text-slate-700">
                  Total Biaya Platform
                </span>
                <span className="flex-shrink-0 font-bold tabular-nums text-red-600">
                  {formatCurrency(stats.totalPlatformFees)}
                </span>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Biaya Pengiriman
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">
                Komponen ongkir &amp; pengembalian
              </p>
              <div className="mt-2.5 space-y-1.5">
                {shippingRows.map((row) => (
                  <FeeRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
              {stats.totalRefundToBuyer > 0 && (
                <div className="mt-2.5 rounded-lg border border-red-100 bg-red-50/50 p-2.5">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-red-700">Pengembalian ke Pembeli</span>
                    <span className="flex-shrink-0 font-medium tabular-nums text-red-600">
                      {formatCurrency(stats.totalRefundToBuyer)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Seller-sponsored */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Diskon &amp; Cashback Disponsor
              </h4>
              <p className="mt-0.5 text-xs text-slate-500">
                Promo yang ikut memotong penghasilan
              </p>
              <div className="mt-2.5 space-y-1.5">
                {sellerRows.map((row) => (
                  <FeeRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-4 border-t border-slate-200 pt-2.5 text-sm">
                <span className="font-semibold text-slate-700">
                  Total Disponsor
                </span>
                <span className="flex-shrink-0 font-bold tabular-nums text-slate-700">
                  {formatCurrency(stats.totalSellerSponsored)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FeeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-600">{label}</span>
      <span
        className={`flex-shrink-0 font-medium tabular-nums ${
          value > 0 ? 'text-slate-900' : 'text-slate-300'
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}
