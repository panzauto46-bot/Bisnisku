'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Store, Heart } from 'lucide-react'

export function LandingCta() {
  return (
    <section className="bg-white pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 px-8 py-16 text-center shadow-2xl shadow-blue-600/30 lg:px-16 lg:py-20"
        >
          {/* Decorative blobs */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-indigo-300/20 blur-2xl"
          />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Siap mengelola pesanan Anda dengan lebih mudah?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-blue-100">
              Mulai sekarang. Import file Excel pertama Anda dan lihat
              dashboard BisnisKu bekerja dalam hitungan detik.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl transition-all hover:shadow-2xl hover:brightness-95"
              >
                Coba Sekarang
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Lihat Harga
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              BisnisKu
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Fitur
            </a>
            <a
              href="#steps"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Cara Kerja
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Harga
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              FAQ
            </a>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Masuk Aplikasi
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} BisnisKu. Dilisensikan di bawah
            MIT License.
          </p>
          <p className="flex items-center gap-1.5">
            Dibuat dengan <Heart className="h-4 w-4 text-rose-500" /> oleh Pandu
            Dargah
          </p>
        </div>
      </div>
    </footer>
  )
}
