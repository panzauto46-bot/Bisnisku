import { OrdersTable } from '@/components/orders/orders-table'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Semua Pesanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar lengkap semua pesanan dari toko Anda
        </p>
      </div>
      <OrdersTable status="all" />
    </div>
  )
}
