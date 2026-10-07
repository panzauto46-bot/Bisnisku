'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatNumber } from '@/utils/format'

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    inserted: number
    skipped: number
    totalRows: number
    fileName: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          inserted: data.data.inserted,
          skipped: data.data.skipped,
          totalRows: data.data.totalRows,
          fileName: data.data.fileName,
        })
        toast.success(`Berhasil mengimport ${data.data.inserted} pesanan!`)
      } else {
        setError(data.error || 'Gagal mengimport file')
        toast.error(data.error || 'Gagal mengimport file')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    // Reset input
    e.target.value = ''
  }

  const handleReset = useCallback(async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/reset', { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        toast.success('Semua data berhasil dihapus')
        setResult(null)
        setError(null)
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload File Excel</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            animate={{
              borderColor: isDragging
                ? '#3b82f6'
                : error
                  ? '#ef4444'
                  : '#cbd5e1',
              backgroundColor: isDragging
                ? '#eff6ff'
                : error
                  ? '#fef2f2'
                  : '#f8fafc',
            }}
            transition={{ duration: 0.2 }}
            className="flex cursor-pointer flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed p-12 transition-colors"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <motion.div
              animate={{
                scale: isDragging ? 1.1 : 1,
                y: isDragging ? -5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isDragging ? 'bg-blue-100' : 'bg-slate-100'
              }`}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              ) : (
                <Upload
                  className={`h-8 w-8 ${
                    isDragging ? 'text-blue-500' : 'text-slate-400'
                  }`}
                />
              )}
            </motion.div>

            <div className="text-center">
              <p className="font-semibold text-slate-900">
                {uploading
                  ? 'Sedang mengupload...'
                  : isDragging
                    ? 'Lepaskan file di sini'
                    : 'Drag & drop file Excel atau klik untuk memilih'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Support format .xlsx dan .xls (maksimal 50MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Gagal Import
                    </p>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-800">
                        Import Berhasil!
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        File <strong>{result.fileName}</strong> berhasil
                        diproses
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-slate-500">Total Baris</p>
                          <p className="text-lg font-bold text-slate-900">
                            {formatNumber(result.totalRows)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-slate-500">Terimport</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {formatNumber(result.inserted)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs text-slate-500">
                            Duplikat/Skip
                          </p>
                          <p className="text-lg font-bold text-amber-600">
                            {formatNumber(result.skipped)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a href="/orders">
                          <Button size="sm">Lihat Pesanan</Button>
                        </a>
                        <a href="/">
                          <Button size="sm" variant="outline">
                            Ke Dashboard
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cara Export Data dari Marketplace</CardTitle>
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
                Pergi ke <strong>My Orders</strong> → pilih tab{' '}
                <strong>All</strong> atau <strong>To Ship</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                3
              </span>
              <span>
                Klik <strong>Export</strong> → pilih date range →{' '}
                <strong>Download</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                4
              </span>
              <span>
                Upload file yang sudah didownload ke form di atas
              </span>
            </li>
          </ol>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
            <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              File harus memiliki kolom: No. Pesanan, Status Pesanan, Nama
              Produk, dan Total Pembayaran
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetOpen}
        title="Reset semua data?"
        description="Semua pesanan, harga modal produk, dan riwayat import akan dihapus permanen. Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah backup file Excel aslinya."
        confirmLabel="Ya, hapus semua"
        loading={resetting}
        onConfirm={handleReset}
        onCancel={() => !resetting && setResetOpen(false)}
      />
    </div>
  )
}
