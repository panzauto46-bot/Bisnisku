'use client'

import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'
import type { DiscountBreakdown } from '@/types/order.types'

interface DiscountBreakdownCardProps {
  discount: DiscountBreakdown
  completedCount: number
}

interface Row {
  label: string
  value: number
  note?: string
}

export function DiscountBreakdownCard({
  discount,
  completedCount,
}: DiscountBreakdownCardProps) {
  const productRows: Row[] = [
    { label: 'Diskon dari Penjual', value: discount.sellerDiscount },
    { label: 'Diskon dari Platform', value: discount.platformDiscount },
    { label: 'Voucher Ditanggung Penjual', value: discount.sellerVoucher },
  ]

  const platformRows: Row[] = [
    { label: 'Voucher Ditanggung Platform', value: discount.platformVoucher },
    { label: 'Potongan Koin Platform', value: discount.platformCoinDeduction },
    { label: 'Cashback Koin', value: discount.coinCashback },
    { label: 'Diskon Kartu Kredit', value: discount.creditCardDiscount },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4.5 w-4.5 text-amber-600" />
                Rincian Potongan Platform
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Setiap komponen potongan harga yang dikenakan platform,
                dihitung dari{' '}
                <span className="font-medium text-slate-700">
                  {completedCount} pesanan Selesai
                </span>{' '}
                (sama seperti basis pendapatan)
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-x-10 gap-y-6 p-6 lg:grid-cols-2">
          {/* Left column: the deductions themselves */}
          <div className="space-y-5">
            <RowGroup
              title="Potongan Harga Produk"
              rows={productRows}
              totalLabel="Total Diskon"
              totalValue={discount.totalProductDiscount}
            />

            <RowGroup
              title="Potongan Platform Saat Bayar"
              rows={platformRows}
              totalLabel="Subtotal Potongan Platform"
              totalValue={discount.totalPlatformDeduction}
              muted
            />

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Total Semua Potongan
                  </p>
                  <p className="text-xs text-amber-700">
                    Diskon produk + potongan platform saat bayar
                  </p>
                </div>
                <p className="text-xl font-bold tabular-nums text-amber-700">
                  {formatCurrency(discount.totalAllDeductions)}
                </p>
              </div>
            </div>
          </div>

          {/* Right column: explanation */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Kenapa ini penting?
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
              <li className="flex gap-2">
                <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                <span>
                  <strong>Total Diskon</strong> di dashboard hanya mencakup
                  diskon produk (penjual + platform + voucher penjual).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                <span>
                  Voucher platform, koin, dan diskon kartu kredit dipotong
                  terpisah saat checkout — angkanya besar dan sering luput
                  dilihat.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                <span>
                  Panel ini menghitung semuanya dari order{' '}
                  <strong>Selesai</strong> saja, jadi sebanding dengan total
                  pendapatan.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                <span>
                  Panel ini <strong>tidak memuat ongkir</strong> — file pesanan
                  hanya menyimpan estimasi ongkir. Angka real yang dibayarkan
                  ke jasa kirim, gratis ongkir, dan ongkir retur ada di panel{' '}
                  <strong>Penghasilan Bersih Platform</strong> di bawah, beserta
                  bagian <em>Cek Silang</em> yang membandingkan kedua file.
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RowGroup({
  title,
  subtitle,
  rows,
  totalLabel,
  totalValue,
  muted = false,
}: {
  title: string
  subtitle?: string
  rows: Row[]
  totalLabel?: string
  totalValue?: number
  muted?: boolean
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}

      <div className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-slate-600">{row.label}</span>
            <span
              className={`flex-shrink-0 font-medium tabular-nums ${
                row.value > 0 ? 'text-slate-900' : 'text-slate-300'
              }`}
            >
              {formatCurrency(row.value)}
            </span>
          </div>
        ))}
      </div>

      {totalLabel && totalValue !== undefined && (
        <div
          className={`mt-2.5 flex items-center justify-between gap-4 border-t pt-2.5 text-sm ${
            muted ? 'border-slate-200' : 'border-slate-300'
          }`}
        >
          <span className="font-semibold text-slate-700">{totalLabel}</span>
          <span
            className={`flex-shrink-0 font-bold tabular-nums ${
              muted ? 'text-slate-700' : 'text-slate-900'
            }`}
          >
            {formatCurrency(totalValue)}
          </span>
        </div>
      )}
    </div>
  )
}
