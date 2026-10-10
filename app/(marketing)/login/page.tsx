'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Store,
  Upload,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { computeDeviceFingerprint } from '@/lib/license-client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const from = searchParams.get('from') || '/dashboard'

  function handleFile(file: File) {
    setError(null)

    if (!file.name.endsWith('.dat') && file.type !== 'text/plain') {
      setError('File harus berupa license.dat')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = String(e.target?.result ?? '')
      setFileContents(text)
      setFileName(file.name)
    }
    reader.onerror = () => setError('Gagal membaca file')
    reader.readAsText(file)
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!fileContents) {
      setError('Upload file license Anda terlebih dahulu')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const deviceId = await computeDeviceFingerprint()

      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license: fileContents, deviceId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'License tidak valid')
        setLoading(false)
        return
      }

      toast.success(
        `BisnisKu aktif! Paket ${data.planLabel} sampai ${data.expiresAtLabel}`
      )
      router.push(from)
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Aktivasi BisnisKu
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload file license (license.dat) untuk mulai menggunakan aplikasi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Upload className="h-4 w-4 text-slate-400" />
              File License
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('license-file')?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all ${
                dragging
                  ? 'border-blue-400 bg-blue-50'
                  : fileName
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {fileName ? (
                <>
                  <FileCheck2 className="h-8 w-8 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">
                    {fileName}
                  </span>
                  <span className="text-xs text-emerald-600">
                    Klik untuk ganti file
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">
                    Klik atau drag file ke sini
                  </span>
                  <span className="text-xs text-slate-400">license.dat</span>
                </>
              )}
            </div>

            <input
              id="license-file"
              type="file"
              accept=".dat,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading || !fileContents}
            className="group flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/25 transition-all hover:brightness-110 hover:shadow-blue-600/40 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Mengaktifkan...
              </>
            ) : (
              <>
                Aktifkan Sekarang
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-center text-sm text-slate-600">
            Belum punya license?{' '}
            <a
              href="https://wa.me/6288987195278?text=Halo%2C%20saya%20ingin%20membeli%20license%20BisnisKu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Beli sekarang
            </a>
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Satu license berlaku untuk satu perangkat
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke beranda
        </Link>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white px-6 py-16">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -45, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl"
        />
      </div>

      <div className="relative flex w-full items-center justify-center">
        <Suspense
          fallback={
            <div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white/60" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
