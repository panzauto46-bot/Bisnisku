import { OrdersTable } from '@/components/orders/orders-table'

export default function ShippedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pesanan Dikirim</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pesanan yang sedang dalam proses pengiriman
        </p>
      </div>
      <OrdersTable status="shipped" />
    </div>
  )
}
