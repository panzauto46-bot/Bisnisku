'use client'

import { useState, useCallback } from 'react'
import { RotateCcw, Package, Wallet, FileSpreadsheet, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FileUploadZone } from '@/components/import/file-upload-zone'

export default function ImportPage() {
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleReset = useCallback(async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/reset', { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        toast.success('Semua data berhasil dihapus')
      } else {
        toast.error(data.error || 'Gagal mereset data')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan'
      toast.error(message)
    } finally {
      setResetting(false)
      setResetOpen(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload file Excel export dari Marketplace Seller Center
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setResetOpen(true)}
          className="flex-shrink-0 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Data
        </Button>
      </div>

      {/* Two imports: orders + earnings. They are matched to each other by
          order number, so importing both gives the full financial picture. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4.5 w-4.5 text-blue-600" />
              1. File Pesanan
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Daftar pesanan dari menu <strong>My Orders</strong>
            </p>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              accent="blue"
              endpoint="/api/import"
              itemLabel="pesanan"
              note="File harus memiliki kolom: No. Pesanan, Status Pesanan, Nama Produk, dan Total Pembayaran"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4.5 w-4.5 text-emerald-600" />
              2. File Penghasilan
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Laporan penghasilan &amp; semua biaya platform
            </p>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              accent="emerald"
              endpoint="/api/import-earnings"
              itemLabel="data penghasilan"
              note="File harus memiliki sheet Penghasilan dengan kolom No. Pesanan dan Total Penghasilan"
            />
          </CardContent>
        </Card>
      </div>

      {/* Sync explanation */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Kedua file saling melengkapi</p>
          <p className="mt-1 text-blue-700">
            File pesanan berisi status &amp; detail produk, file penghasilan
            berisi dana yang masuk dan semua potongan biaya. Keduanya
            dicocokkan otomatis berdasarkan nomor pesanan. Order yang ada di
            file penghasilan tapi belum diimport pesanannya tetap disimpan dan
            ditandai di dashboard.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cara Export Data dari Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                1
              </span>
              <span>
                Login ke <strong>Marketplace Seller Center</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                2
              </span>
              <span>
                Untuk pesanan: buka <strong>My Orders</strong> →{' '}
                <strong>Export</strong> → pilih date range →{' '}
                <strong>Download</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                3
              </span>
              <span>
                Untuk penghasilan: buka <strong>Finance / Saldo</strong> →{' '}
                <strong>Laporan Penghasilan</strong> → download periode yang
                sama
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                4
              </span>
              <span>Upload kedua file ke form di atas</span>
            </li>
          </ol>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
            <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              Disarankan import file pesanan dulu, lalu file penghasilan dengan
              periode yang sama
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetOpen}
        title="Reset semua data?"
        description="Semua pesanan, data penghasilan, harga modal produk, dan riwayat import akan dihapus permanen. Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah backup file Excel aslinya."
        confirmLabel="Ya, hapus semua"
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => !resetting && setResetOpen(false)}
      />
    </div>
  )
}
