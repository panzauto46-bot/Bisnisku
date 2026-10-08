'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { OrderDetailModal } from '@/components/orders/order-detail-modal'
import { formatCurrency, formatNumber } from '@/utils/format'
import { formatDate } from '@/utils/date'
import type { OrderWithCategory, OrderStatus } from '@/types/order.types'

interface OrdersTableProps {
  status?: OrderStatus
  title?: string
}

const statusFilters: Record<OrderStatus, string> = {
  all: 'all',
  pending: 'pending',
  shipped: 'shipped',
  completed: 'completed',
  cancelled: 'cancelled',
}

export function OrdersTable({ status = 'all', title }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderWithCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedOrder, setSelectedOrder] =
    useState<OrderWithCategory | null>(null)

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit, search])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilters[status],
        page: String(page),
        limit: String(limit),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/orders?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-slate-500">Memuat data pesanan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cari nomor pesanan, produk, pembeli..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {formatNumber(total)} pesanan
          </span>
        </div>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm ${status === 'cancelled' ? 'min-w-[1250px]' : 'min-w-[1000px]'}`}>
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    No. Pesanan
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Penghasilan
                  </th>
                  {status === 'cancelled' && (
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Alasan Pembatalan
                    </th>
                  )}
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Metode Bayar
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-slate-900">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge category={order.statusCategory} />
                    </td>
                    <td className="px-4 py-3">
                      <EarningsBadge
                        hasEarnings={order.hasEarnings}
                        category={order.statusCategory}
                      />
                    </td>
                    {status === 'cancelled' && (
                      <td className="px-4 py-3">
                        {order.cancellationReason ? (
                          <span className="inline-flex max-w-[260px] items-start gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium leading-relaxed text-red-700">
                            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-normal break-words">
                              {order.cancellationReason}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Tidak ada keterangan
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <p className="truncate font-medium text-slate-900">
                          {order.productName}
                        </p>
                        {order.variantName && (
                          <p className="truncate text-xs text-slate-500">
                            {order.variantName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(order.discountedPrice)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(order.totalPayment)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {order.paymentMethod || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {formatDate(order.orderCreatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                      >
                        Detail
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Halaman {page} dari {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (page > 3) {
                      pageNum = page - 2 + i
                    }
                    if (page > totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    }
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={pageNum === page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Badge status penghasilan — menandakan apakah order sudah ada di file
 * penghasilan yang di-import (dananya sudah dilepaskan platform).
 *
 - Sudah Cair  : ada di order_earnings (data dari import file penghasilan)
 - Belum Cair  : belum ada di file penghasilan (dana belum dilepas)
 - Tidak Ada   : order dibatalkan, tidak akan pernah ada penghasilan
 */
function EarningsBadge({
  hasEarnings,
  category,
}: {
  hasEarnings?: boolean
  category: OrderStatus
}) {
  if (category === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
        <XCircle className="h-3 w-3" />
        Tidak Ada
      </span>
    )
  }

  if (hasEarnings) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Sudah Cair
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
      <Clock className="h-3 w-3" />
      Belum Cair
    </span>
  )
}

function EmptyState({ status }: { status: OrderStatus }) {
  const config = {
    all: { icon: Package, title: 'Belum ada pesanan' },
    pending: { icon: Clock, title: 'Tidak ada pesanan perlu dikirim' },
    shipped: { icon: Truck, title: 'Tidak ada pesanan dikirim' },
    completed: { icon: CheckCircle2, title: 'Tidak ada pesanan selesai' },
    cancelled: { icon: XCircle, title: 'Tidak ada pesanan dibatalkan' },
  }

  const { icon: Icon, title } = config[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-slate-300 bg-white py-20"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">
          Import file Excel dari marketplace untuk melihat data pesanan
        </p>
      </div>
      <a href="/import">
        <Button variant="default" size="md">
          Import Data
        </Button>
      </a>
    </motion.div>
  )
}
