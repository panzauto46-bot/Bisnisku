'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Table,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type ExportFormat = 'csv' | 'xlsx' | 'pdf'
type ExportType = 'orders' | 'profit' | 'stats'

interface ExportOption {
  type: ExportType
  format: ExportFormat
  label: string
  description: string
}

const OPTIONS: ExportOption[] = [
  {
    type: 'orders',
    format: 'csv',
    label: 'Pesanan - CSV',
    description: 'Semua kolom, siap olah di Excel',
  },
  {
    type: 'orders',
    format: 'xlsx',
    label: 'Pesanan - Excel',
    description: 'Semua kolom dengan format Excel',
  },
  {
    type: 'orders',
    format: 'pdf',
    label: 'Pesanan - PDF',
    description: 'Tabel lengkap, multi-halaman',
  },
  {
    type: 'profit',
    format: 'csv',
    label: 'Profit - CSV',
    description: 'Laba per produk',
  },
  {
    type: 'profit',
    format: 'xlsx',
    label: 'Profit - Excel',
    description: 'Laba per produk + ringkasan',
  },
  {
    type: 'profit',
    format: 'pdf',
    label: 'Profit - PDF',
    description: 'Laporan profit dengan ringkasan',
  },
  {
    type: 'stats',
    format: 'csv',
    label: 'Statistik - CSV',
    description: 'Metrik, produk, metode bayar',
  },
  {
    type: 'stats',
    format: 'xlsx',
    label: 'Statistik - Excel',
    description: 'Metrik lengkap dashboard',
  },
  {
    type: 'stats',
    format: 'pdf',
    label: 'Statistik - PDF',
    description: 'Laporan ringkasan 1-2 halaman',
  },
]

function typeIcon(type: ExportType) {
  switch (type) {
    case 'orders':
      return Table
    case 'profit':
      return TrendingUp
    case 'stats':
      return BarChart3
  }
}

function formatIcon(format: ExportFormat) {
  switch (format) {
    case 'csv':
      return FileText
    case 'xlsx':
      return FileSpreadsheet
    case 'pdf':
      return FileText
  }
}

export function ExportMenu() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (option: ExportOption) => {
    const key = `${option.type}-${option.format}`
    setLoading(key)
    try {
      const params = new URLSearchParams({
        type: option.type,
        format: option.format,
      })

      const response = await fetch(`/api/export?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Gagal export data')
      }

      // Get filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition')
      const fileNameMatch = disposition?.match(/filename="([^"]+)"/)
      const fileName = fileNameMatch
        ? fileNameMatch[1]
        : `bisnisku-${option.type}.${option.format}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`${option.label} berhasil diunduh`)
      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan'
      toast.error(message)
    } finally {
      setLoading(null)
    }
  }

  // Group options by type
  const grouped = OPTIONS.reduce((acc, option) => {
    if (!acc[option.type]) acc[option.type] = []
    acc[option.type].push(option)
    return acc
  }, {} as Record<ExportType, ExportOption[]>)

  const typeLabels: Record<ExportType, string> = {
    orders: 'Data Pesanan',
    profit: 'Analisis Profit',
    stats: 'Statistik Dashboard',
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="default"
        size="md"
        onClick={() => setOpen(!open)}
        className="flex-shrink-0"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export Data
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                Export Data
              </p>
              <p className="text-xs text-slate-500">
                Pilih jenis data & format file
              </p>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {(Object.keys(grouped) as ExportType[]).map((type) => {
                const TypeIcon = typeIcon(type)
                return (
                  <div key={type} className="border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2 bg-white px-4 py-2">
                      <TypeIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                        {typeLabels[type]}
                      </span>
                    </div>

                    {grouped[type].map((option) => {
                      const FormatIcon = formatIcon(option.format)
                      const key = `${option.type}-${option.format}`
                      const isLoading = loading === key

                      return (
                        <button
                          key={key}
                          onClick={() => handleExport(option)}
                          disabled={isLoading}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            ) : (
                              <FormatIcon className="h-4 w-4 text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {option.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {option.description}
                            </p>
                          </div>
                          {!isLoading && (
                            <Download className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
