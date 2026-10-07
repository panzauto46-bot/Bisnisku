'use client'

import { motion } from 'framer-motion'
import {
  X,
  Package,
  CreditCard,
  Truck,
  User,
  Calendar,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency } from '@/utils/format'
import { formatDateTime } from '@/utils/date'
import type { OrderWithCategory } from '@/types/order.types'

interface OrderDetailModalProps {
  order: OrderWithCategory
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const CopyableField = ({
    label,
    value,
    fieldName,
  }: {
    label: string
    value: string | null | undefined
    fieldName: string
  }) => {
    if (!value) return null

    return (
      <div className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900">{value}</span>
          <button
            onClick={() => handleCopy(value, fieldName)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            {copiedField === fieldName ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-lg font-bold text-slate-900">
                  {order.orderNumber}
                </h2>
                <StatusBadge category={order.statusCategory} />
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                Detail Pesanan Lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="max-h-[calc(90vh-80px)] space-y-6 overflow-y-auto p-6">
          {/* Cancellation Alert */}
          {order.statusCategory === 'cancelled' &&
            order.cancellationReason && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Pesanan Dibatalkan
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    {order.cancellationReason}
                  </p>
                </div>
              </motion.div>
            )}

          {/* Product Section */}
          <Section icon={Package} title="Detail Produk">
            <div className="space-y-1">
              <CopyableField
                label="Nama Produk"
                value={order.productName}
                fieldName="productName"
              />
              <CopyableField
                label="Nama Variasi"
                value={order.variantName}
                fieldName="variantName"
              />
              <CopyableField
                label="SKU Induk"
                value={order.parentSku}
                fieldName="parentSku"
              />
              <CopyableField
                label="Nomor Referensi SKU"
                value={order.skuReference}
                fieldName="skuReference"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">Berat Produk</span>
                <span className="text-sm font-medium text-slate-900">
                  {order.productWeight || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">Total Berat</span>
                <span className="text-sm font-medium text-slate-900">
                  {order.totalWeight || '-'}
                </span>
              </div>
            </div>
          </Section>

          {/* Pricing Section */}
          <Section icon={CreditCard} title="Harga & Diskon">
            <div className="space-y-1">
              <PriceRow
                label="Harga Awal"
                value={order.originalPrice}
              />
              <PriceRow
                label="Harga Setelah Diskon"
                value={order.discountedPrice}
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">Jumlah</span>
                <span className="text-sm font-medium text-slate-900">
                  {order.quantity}
                </span>
              </div>
              <PriceRow label="Subtotal Pesanan" value={order.subtotal} />
              <PriceRow
                label="Total Diskon"
                value={order.totalDiscount}
                negative
              />
              <PriceRow
                label="Diskon dari Penjual"
                value={order.sellerDiscount}
                negative
              />
              <PriceRow
                label="Diskon dari Platform"
                value={order.platformDiscount}
                negative
              />
              <PriceRow
                label="Voucher Ditanggung Penjual"
                value={order.sellerVoucher}
                negative
              />
              <PriceRow
                label="Voucher Ditanggung Platform"
                value={order.platformVoucher}
                negative
              />
              <PriceRow
                label="Potongan Koin Platform"
                value={order.platformCoinDeduction}
                negative
              />
              <PriceRow
                label="Cashback Koin"
                value={order.coinCashback}
              />
              <div className="mt-2 border-t border-slate-200 pt-2">
                <PriceRow
                  label="Total Pembayaran"
                  value={order.totalPayment}
                  bold
                />
              </div>
            </div>
          </Section>

          {/* Shipping Section */}
          <Section icon={Truck} title="Pengiriman">
            <div className="space-y-1">
              <CopyableField
                label="Opsi Pengiriman"
                value={order.shippingOption}
                fieldName="shippingOption"
              />
              <CopyableField
                label="No. Resi"
                value={order.trackingNumber}
                fieldName="trackingNumber"
              />
              <CopyableField
                label="Antar ke Counter/Pick-up"
                value={order.pickupType}
                fieldName="pickupType"
              />
              <PriceRow
                label="Ongkos Kirim Dibayar Pembeli"
                value={order.shippingFeePaidByBuyer}
              />
              <PriceRow
                label="Perkiraan Ongkos Kirim"
                value={
                  typeof order.estimatedShipping === 'number'
                    ? order.estimatedShipping
                    : 0
                }
              />
              <PriceRow
                label="Estimasi Potongan Biaya Pengiriman"
                value={order.estimatedShippingDiscount}
              />
              <PriceRow
                label="Ongkos Kirim Pengembalian"
                value={order.returnShippingFee}
              />
            </div>
          </Section>

          {/* Customer Section */}
          <Section icon={User} title="Informasi Pembeli">
            <div className="space-y-1">
              <CopyableField
                label="Username"
                value={order.buyerUsername}
                fieldName="buyerUsername"
              />
              <CopyableField
                label="Nama Penerima"
                value={order.recipientName}
                fieldName="recipientName"
              />
              <CopyableField
                label="No. Telepon"
                value={order.phoneNumber}
                fieldName="phoneNumber"
              />
              <CopyableField
                label="Alamat Pengiriman"
                value={order.shippingAddress}
                fieldName="shippingAddress"
              />
              <CopyableField
                label="Kota/Kabupaten"
                value={order.city}
                fieldName="city"
              />
              <CopyableField
                label="Provinsi"
                value={order.province}
                fieldName="province"
              />
            </div>
          </Section>

          {/* Payment & Timeline Section */}
          <Section icon={Calendar} title="Pembayaran & Timeline">
            <div className="space-y-1">
              <CopyableField
                label="Metode Pembayaran"
                value={order.paymentMethod}
                fieldName="paymentMethod"
              />
              <CopyableField
                label="Tipe Pesanan"
                value={order.orderType}
                fieldName="orderType"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">
                  Waktu Pesanan Dibuat
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDateTime(order.orderCreatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">
                  Waktu Pembayaran
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDateTime(order.paymentTime)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">
                  Waktu Pengiriman Diatur
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDateTime(order.shippingTimeSet)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">
                  Batas Pengiriman
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDateTime(order.shipByDeadline)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-500">
                  Waktu Selesai
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDateTime(order.completedAt)}
                </span>
              </div>
            </div>
          </Section>

          {/* Notes Section */}
          {(order.buyerNote || order.sellerNote) && (
            <Section icon={AlertCircle} title="Catatan">
              <div className="space-y-3">
                {order.buyerNote && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-amber-700">
                      Catatan dari Pembeli
                    </p>
                    <p className="text-sm text-amber-900">{order.buyerNote}</p>
                  </div>
                )}
                {order.sellerNote && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-blue-700">
                      Catatan
                    </p>
                    <p className="text-sm text-blue-900">{order.sellerNote}</p>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
        {children}
      </div>
    </motion.div>
  )
}

function PriceRow({
  label,
  value,
  bold = false,
  negative = false,
}: {
  label: string
  value: number | null | undefined
  bold?: boolean
  negative?: boolean
}) {
  if (value === null || value === undefined) return null

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span
        className={`text-sm ${bold ? 'font-semibold text-slate-900' : 'text-slate-500'}`}
      >
        {label}
      </span>
      <span
        className={`text-sm tabular-nums ${
          bold
            ? 'font-bold text-slate-900'
            : negative && value > 0
              ? 'font-medium text-red-600'
              : 'font-medium text-slate-900'
        }`}
      >
        {negative && value > 0 ? '-' : ''}
        {formatCurrency(value)}
      </span>
    </div>
  )
}
