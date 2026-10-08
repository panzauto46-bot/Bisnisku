'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/format'
import type { OrderEarnings } from '@/types/earnings.types'
import type { OrderWithCategory } from '@/types/order.types'

interface EarningsDetailSectionProps {
  order: OrderWithCategory
}

interface Row {
  label: string
  value: number | null
  /** Baris info konteks (mis. Harga Sebelum Diskon) yang tidak masuk ke
   *  perhitungan subtotal kelompok. */
  excludeFromTotal?: boolean
}

/**
 * Rincian Penghasilan — disusun mengikuti tampilan settlement report di
 * Seller Center: dari Subtotal Pesanan turun ke bawah lewat setiap kelompok
 * biaya sampai Estimasi Total Penghasilan.
 *
 * Angka diutamakan dari file penghasilan (settlement, angka real). Field yang
 * hanya ada di file pesanan (diskon penjual, voucher, koin) tetap diambil
 * dari sana. Jika file penghasilan belum di-import, bagian biaya platform
 * menampilkan catatan, sedangkan bagian atas tetap tampil dari file pesanan.
 */
export function EarningsDetailSection({ order }: EarningsDetailSectionProps) {
  const [earnings, setEarnings] = useState<OrderEarnings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchEarnings() {
      try {
        const response = await fetch(`/api/earnings/${order.orderNumber}`)
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
  }, [order.orderNumber])

  // Harga produk: prioritas file penghasilan, fallback file pesanan
  const productPrice = earnings?.productPrice ?? order.subtotal ?? 0

  /* ----------------------------- Blok subtotal ---------------------------- */
  const subtotalRows: Row[] = [
    ...(order.originalPrice && order.originalPrice !== productPrice
      ? [
          {
            label: 'Harga Sebelum Diskon',
            value: order.originalPrice,
            excludeFromTotal: true,
          },
        ]
      : []),
    { label: 'Harga Produk', value: productPrice },
    {
      label: 'Ongkir Dibayar Pembeli',
      value:
        earnings?.shippingPaidByBuyer ?? order.shippingFeePaidByBuyer ?? null,
    },
    { label: 'Ongkir Dibayar ke Jasa Kirim', value: earnings?.shippingPaidToCourier ?? null },
    {
      label: 'Potongan Ongkir dari Platform',
      value: earnings?.freeShippingFromPlatform ?? null,
    },
  ]

  /* --------------------------- Voucher & subsidi -------------------------- */
  const voucherRows: Row[] = [
    { label: 'Diskon dari Penjual', value: -(order.sellerDiscount ?? 0) || null },
    {
      label: 'Diskon Produk dari Platform',
      value: -(earnings?.platformProductDiscount ?? order.platformDiscount ?? 0) || null,
    },
    { label: 'Voucher Ditanggung Penjual', value: -(order.sellerVoucher ?? 0) || null },
    { label: 'Voucher Ditanggung Platform', value: -(order.platformVoucher ?? 0) || null },
    { label: 'Potongan Koin Platform', value: -(order.platformCoinDeduction ?? 0) || null },
    { label: 'Cashback Koin', value: order.coinCashback ?? null },
    { label: 'Diskon Kartu Kredit', value: -(order.creditCardDiscount ?? 0) || null },
  ]

  /* ------------------------------ Kelompok biaya -------------------------- */
  const platformFeeRows: Row[] = [
    { label: 'Biaya Administrasi', value: earnings?.adminFee ?? null },
    { label: 'Biaya Proses Pesanan', value: earnings?.orderProcessFee ?? null },
  ]

  const freeShippingRows: Row[] = [
    {
      label: 'Biaya Gratis Ongkir XTRA (Ukuran Biasa)',
      value: earnings?.freeShippingXtraFee ?? null,
    },
  ]

  const serviceRows: Row[] = [
    { label: 'Biaya Layanan Promo XTRA+', value: earnings?.serviceFeePromoXtra ?? null },
    { label: 'Biaya Komisi AMS', value: earnings?.amsCommissionFee ?? null },
  ]

  const promoRows: Row[] = [
    { label: 'Biaya Kampanye', value: earnings?.campaignFee ?? null },
    { label: 'Biaya Isi Saldo Otomatis', value: earnings?.autoTopupFee ?? null },
  ]

  const otherRows: Row[] = [
    { label: 'Premi', value: earnings?.premium ?? null },
    { label: 'FBS Fee', value: earnings?.fbsFee ?? null },
    { label: 'Ongkos Kirim Pengembalian', value: earnings?.returnShippingFee ?? null },
    { label: 'Pengembalian ke Pembeli', value: earnings?.refundToBuyer ?? null },
  ]

  const taxRows: Row[] = [{ label: 'PPh 22', value: earnings?.pph22 ?? null }]

  const hasSettlementData = !!earnings

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Rincian Penghasilan
        </h3>
        {earnings?.releaseDate && (
          <span className="text-xs text-slate-400">
            Dana dilepaskan {earnings.releaseDate}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
        {/* Bagian atas: selalu ada (dari file pesanan) */}
        <GroupBlock title="Subtotal Pesanan" rows={subtotalRows} />
        <GroupBlock title="Voucher & Subsidi" rows={voucherRows} />

        {order.totalPayment !== null && order.totalPayment !== undefined && (
          <div className="mt-2 flex items-center justify-between border-t border-emerald-200 pt-2 text-sm">
            <span className="font-semibold text-slate-700">
              Total Pembayaran
            </span>
            <span className="font-bold tabular-nums text-slate-900">
              {formatCurrency(order.totalPayment)}
            </span>
          </div>
        )}

        {/* Bagian bawah: butuh file penghasilan */}
        {loading ? (
          <div className="mt-4 flex items-center gap-2 border-t border-emerald-200 pt-3 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Memuat data penghasilan...
          </div>
        ) : !hasSettlementData ? (
          <div className="mt-4 rounded-lg border border-dashed border-emerald-200 bg-white/70 p-3">
            <p className="text-xs leading-relaxed text-slate-500">
              Rincian biaya platform belum tersedia karena order ini belum ada
              di file penghasilan yang di-import.
            </p>
            <Link
              href="/import"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Upload className="h-3.5 w-3.5" />
              Import file penghasilan
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3 border-t border-emerald-200 pt-3">
              <GroupBlock title="Biaya Platform" rows={platformFeeRows} />
              <GroupBlock title="Biaya Gratis Ongkir XTRA" rows={freeShippingRows} />
              <GroupBlock title="Biaya Layanan" rows={serviceRows} />
              <GroupBlock title="Biaya Promosi" rows={promoRows} />
              <GroupBlock title="Biaya Lainnya" rows={otherRows} />
              <GroupBlock title="Pajak" rows={taxRows} />
            </div>

            <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Estimasi Total Penghasilan
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Yang masuk ke saldo penjual
                  </p>
                </div>
                <p
                  className={`text-xl font-bold tabular-nums ${
                    earnings.totalEarnings < 0
                      ? 'text-red-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {formatCurrency(earnings.totalEarnings)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Satu kelompok dengan header total dan baris-baris anak. Baris bernilai 0
 * atau null disembunyikan agar tampilan tidak berisik — sama seperti di
 * Seller Center.
 */
function GroupBlock({ title, rows }: { title: string; rows: Row[] }) {
  const visible = rows.filter((r) => r.value !== null && r.value !== 0)
  if (visible.length === 0) return null

  const total = visible
    .filter((r) => !r.excludeFromTotal)
    .reduce((s, r) => s + (r.value ?? 0), 0)

  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{title}</span>
        <span className="font-semibold tabular-nums text-slate-700">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="mt-1.5 space-y-1 border-l border-slate-200 pl-3">
        {visible.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-slate-500">{row.label}</span>
            <span
              className={`tabular-nums ${
                (row.value ?? 0) < 0
                  ? 'font-medium text-red-600'
                  : 'text-slate-700'
              }`}
            >
              {formatCurrency(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
