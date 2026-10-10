'use client'

import { motion } from 'framer-motion'
import {
  FileSpreadsheet,
  BarChart3,
  Wallet,
  TrendingUp,
  Filter,
  Download,
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: 'Import Otomatis',
    desc: 'Upload file Excel pesanan & penghasilan marketplace. Data otomatis terbaca, terstruktur, dan tersimpan rapi.',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    desc: 'Lihat metrik penting: total pesanan, pendapatan, status distribusi, metode pembayaran, dan produk terlaris dalam grafik interaktif.',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Wallet,
    title: 'Rincian Penghasilan',
    desc: 'Transparansi penuh setiap potongan platform: biaya admin, proses pesanan, ongkir, hingga PPh 22 — per order, jelas.',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Analisis Profit',
    desc: 'Hitung laba kotor per produk, margin keuntungan, dan produk mana yang paling menguntungkan untuk Anda.',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Filter,
    title: 'Filter per Status',
    desc: 'Pisahkan pesanan perlu dikirim, dalam pengiriman, selesai, dan dibatalkan. Kelola setiap tahap dengan mudah.',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Download,
    title: 'Export Multi-Format',
    desc: 'Download data sebagai CSV, Excel, atau PDF — untuk Pesanan, Profit, Statistik, dan Penghasilan. 12 opsi siap pakai.',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            Fitur Lengkap
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Semua yang Anda butuhkan untuk kelola pesanan
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Dari import file Excel hingga laporan profit — BisnisKu mengurus
            semuanya.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
