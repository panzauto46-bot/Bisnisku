import { OrdersTable } from '@/components/orders/orders-table'

export default function CancelledPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pesanan Dibatalkan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pesanan yang dibatalkan oleh pembeli atau seller
        </p>
      </div>
      <OrdersTable status="cancelled" />
    </div>
  )
}
