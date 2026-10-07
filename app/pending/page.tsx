import { OrdersTable } from '@/components/orders/orders-table'

export default function PendingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pesanan Perlu Dikirim
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pesanan yang sudah dibayar dan menunggu untuk dikirim
        </p>
      </div>
      <OrdersTable status="pending" />
    </div>
  )
}
