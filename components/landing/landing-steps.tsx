'use client'

import { motion } from 'framer-motion'
import { Upload, BarChart3, Download } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: 'Import File Excel',
    desc: 'Download file export pesanan & penghasilan dari marketplace, lalu upload ke BisnisKu. Data otomatis terbaca dan tersimpan.',
  },
  {
    icon: BarChart3,
    title: 'Lihat Analisisnya',
    desc: 'Dashboard langsung menampilkan metrik, grafik pendapatan, rincian penghasilan, dan analisis profit secara otomatis.',
  },
  {
    icon: Download,
    title: 'Kelola & Export',
    desc: 'Filter pesanan per status, kelola pengiriman, dan download laporan dalam format CSV, Excel, atau PDF profesional.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function LandingSteps() {
  return (
    <section
      id="steps"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            Cara Kerja
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hanya 3 langkah mudah
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tidak perlu setting rumit atau koneksi API. Langsung dari file
            Excel Anda.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 md:block" />

          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              variants={item}
              className="relative text-center"
            >
              <div className="relative inline-flex">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                  <step.icon className="h-9 w-9 text-blue-600" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg">
                  {index + 1}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-slate-600">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
