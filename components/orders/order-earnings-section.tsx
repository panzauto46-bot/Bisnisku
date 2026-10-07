'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { OrderEarnings } from '@/types/earnings.types'

interface OrderEarningsSectionProps {
  orderNumber: string
}

/**
 * Shows the settlement data for a single order, pulled from the imported
 * "Laporan Penghasilan" file. Rendered only when settlement data exists.
 */
export function OrderEarningsSection({ orderNumber }: OrderEarningsSectionProps) {
  const [earnings, setEarnings] = useState<OrderEarnings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchEarnings() {
      try {
        const response = await fetch(`/api/earnings/${orderNumber}`)
        const data = await response.json()
        if (!cancelled && data.success) {
          setEarnings(data.data)
        }
      } catch (error) {
        console.error('Error fetching earnings:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEarnings()

    return () => {
      cancelled = true
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data penghasilan...
      </div>
    )
  }

  if (!earnings) return null

  const feeRows: { label: string; value: number | null }[] = [
    { label: 'Biaya Administrasi', value: earnings.adminFee },
    { label: 'Biaya Proses Pesanan', value: earnings.orderProcessFee },
    { label: 'Biaya Transaksi', value: earnings.transactionFee },
    {
      label: 'Biaya Layanan Promo XTRA+',
      value: earnings.serviceFeePromoXtra,
    },
    { label: 'Biaya Gratis Ongkir XTRA', value: earnings.freeShippingXtraFee },
    { label: 'Biaya Kampanye', value: earnings.campaignFee },
    { label: 'Biaya Komisi AMS', value: earnings.amsCommissionFee },
    { label: 'Biaya Isi Saldo Otomatis', value: earnings.autoTopupFee },
    { label: 'Premi', value: earnings.premium },
    { label: 'FBS Fee', value: earnings.fbsFee },
    { label: 'PPh 22', value: earnings.pph22 },
  ]

  const hasFees = feeRows.some((r) => r.value !== null && r.value !== 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Penghasilan &amp; Biaya Platform
        </h3>
        {earnings.releaseDate && (
          <span className="text-xs text-slate-400">
            Dana dilepaskan {earnings.releaseDate}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
        {/* Headline */}
        <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Penghasilan Bersih
            </p>
            <p className="text-[11px] text-slate-500">
              Yang masuk ke saldo penjual
            </p>
          </div>
          <span
            className={`text-xl font-bold tabular-nums ${
              earnings.totalEarnings < 0
                ? 'text-red-600'
                : 'text-emerald-700'
            }`}
          >
            {formatCurrency(earnings.totalEarnings)}
          </span>
        </div>

        <div className="space-y-1">
          <FeeRow label="Harga Produk" value={earnings.productPrice} />
          <FeeRow
            label="Ongkir Dibayar Pembeli"
            value={earnings.shippingPaidByBuyer}
          />
          <FeeRow
            label="Ongkir ke Jasa Kirim"
            value={earnings.shippingPaidToCourier}
          />
          <FeeRow
            label="Gratis Ongkir dari Platform"
            value={earnings.freeShippingFromPlatform}
          />
          {hasFees && (
            <>
              <div className="my-2 border-t border-emerald-200" />
              {feeRows.map((row) => (
                <FeeRow key={row.label} label={row.label} value={row.value} />
              ))}
            </>
          )}
          {earnings.refundToBuyer !== null && earnings.refundToBuyer !== 0 && (
            <FeeRow
              label="Pengembalian ke Pembeli"
              value={earnings.refundToBuyer}
            />
          )}
        </div>

        {earnings.buyerPaidAmount !== null && (
          <div className="mt-3 flex items-center justify-between border-t border-emerald-200 pt-2 text-xs text-slate-500">
            <span>Dibayar pembeli</span>
            <span className="font-medium tabular-nums text-slate-700">
              {formatCurrency(earnings.buyerPaidAmount)}
              {earnings.buyerPaymentMethod
                ? ` · ${earnings.buyerPaymentMethod}`
                : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FeeRow({
  label,
  value,
}: {
  label: string
  value: number | null
}) {
  if (value === null || value === 0) return null

  // Fees are stored negative in the settlement export
  const isFee = value < 0

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`text-sm font-medium tabular-nums ${
          isFee ? 'text-red-600' : 'text-slate-900'
        }`}
      >
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  )
}
