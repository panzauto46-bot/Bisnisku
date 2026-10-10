'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/utils/format'

export interface UploadResult {
  inserted: number
  updated?: number
  skipped: number
  totalRows: number
  fileName: string
}

interface FileUploadZoneProps {
  /** Accent color: blue for orders, emerald for earnings */
  accent?: 'blue' | 'emerald'
  /** Endpoint to POST the file to */
  endpoint: string
  /** Success toast + result card label */
  itemLabel: string
  /** Extra info line shown under the dropzone */
  note?: string
}

export function FileUploadZone({
  accent = 'blue',
  endpoint,
  itemLabel,
  note,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setError(null)
      setResult(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.success) {
          const d = data.data
          setResult({
            inserted: d.inserted,
            updated: d.updated,
            skipped: d.skipped,
            totalRows: d.totalRows,
            fileName: d.fileName,
          })
          toast.success(
            `Berhasil mengimport ${d.inserted} ${itemLabel}!` +
              (d.updated ? ` (${d.updated} diperbarui)` : '')
          )
        } else {
          const msg = data.error || `Gagal mengimport file ${itemLabel}`
          setError(msg)
          toast.error(msg)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Terjadi kesalahan'
        setError(message)
        toast.error(message)
      } finally {
        setUploading(false)
      }
    },
    [endpoint, itemLabel]
  )

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
    e.target.value = ''
  }

  const active = accent === 'emerald'

  return (
    <div>
      {/* Drop Zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          borderColor: isDragging
            ? active
              ? '#10b981'
              : '#3b82f6'
            : error
              ? '#ef4444'
              : '#cbd5e1',
          backgroundColor: isDragging
            ? active
              ? '#ecfdf5'
              : '#eff6ff'
            : error
              ? '#fef2f2'
              : '#f8fafc',
        }}
        transition={{ duration: 0.2 }}
        className="flex cursor-pointer flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed p-10 transition-colors"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <motion.div
          animate={{
            scale: isDragging ? 1.1 : 1,
            y: isDragging ? -5 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isDragging
              ? active
                ? 'bg-emerald-100'
                : 'bg-blue-100'
              : 'bg-slate-100'
          }`}
        >
          {uploading ? (
            <Loader2
              className={`h-7 w-7 animate-spin ${
                active ? 'text-emerald-500' : 'text-blue-500'
              }`}
            />
          ) : (
            <Upload
              className={`h-7 w-7 ${
                isDragging
                  ? active
                    ? 'text-emerald-500'
                    : 'text-blue-500'
                  : 'text-slate-400'
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

      {note && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          {note}
        </p>
      )}

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
                    File <strong>{result.fileName}</strong> berhasil diproses
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-slate-500">Total Baris</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatNumber(result.totalRows)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-slate-500">
                        {result.updated !== undefined
                          ? 'Baru / Diperbarui'
                          : 'Terimport'}
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatNumber(result.inserted)}
                        {result.updated !== undefined && result.updated > 0 && (
                          <span className="text-sm font-medium text-slate-500">
                            {' '}
                            / {formatNumber(result.updated)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-slate-500">Duplikat/Skip</p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatNumber(result.skipped)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <a href="/dashboard">
                      <Button size="sm">Ke Dashboard</Button>
                    </a>
                    <a href="/orders">
                      <Button size="sm" variant="outline">
                        Lihat Pesanan
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
