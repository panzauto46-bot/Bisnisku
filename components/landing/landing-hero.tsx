'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileSpreadsheet, ShieldCheck, Zap, TrendingUp, Package, Wallet, Store } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const float = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white pt-20 pb-24 lg:pt-28 lg:pb-32">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-32 top-20 h-[28rem] w-[28rem] rounded-full bg-emerald-200/40 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left: copy */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            100% dari file Excel — tanpa API marketplace
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Kelola Pesanan Marketplace Jadi{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Gampang
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            BisnisKu mengubah file Excel export marketplace Anda menjadi
            dashboard profesional. Import otomatis, analisis penghasilan, dan
            laporan siap pakai — semuanya dalam satu aplikasi.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition-all hover:shadow-blue-600/40 hover:brightness-110"
            >
              Coba Sekarang
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Lihat Harga
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {[
              { icon: ShieldCheck, text: 'Data 100% lokal' },
              { icon: Zap, text: 'Import otomatis' },
              { icon: TrendingUp, text: 'Analisis profit' },
            ].map((trust) => (
              <div
                key={trust.text}
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                <trust.icon className="h-4 w-4 text-emerald-500" />
                {trust.text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: floating mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          {/* Main dashboard card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Store className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Pesanan', value: '523', color: 'text-blue-600' },
                { label: 'Selesai', value: '404', color: 'text-emerald-600' },
                { label: 'Pendapatan', value: '68rb', color: 'text-indigo-600' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-[10px] font-medium uppercase text-slate-400">
                    {stat.label}
                  </p>
                  <p className={`mt-1 text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-600">
                  Pendapatan
                </span>
              </div>
              <div className="flex h-28 items-end gap-2">
                {[45, 62, 38, 78, 55, 88, 70, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.08, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-blue-200 to-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            variants={float}
            animate="animate"
            className="absolute -left-8 top-1/4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Penghasilan
                </p>
                <p className="text-sm font-bold text-emerald-600">Sudah Cair</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={float}
            animate="animate"
            transition={{ delay: 1.5 }}
            className="absolute -right-6 bottom-12 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <Package className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Order baru
                </p>
                <p className="text-sm font-bold text-slate-900">+12 hari ini</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
