'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'

// Nomor WhatsApp untuk pembelian key (format internasional tanpa +).
const WA_NUMBER = '6288987195278'

function waLink(planName: string): string {
  const message = `Halo, saya ingin membeli license BisnisKu paket ${planName}. Terima kasih.`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

const PERKS = [
  'Import file Excel pesanan & penghasilan tanpa batas',
  'Dashboard analytics lengkap dengan grafik',
  'Rincian penghasilan & 11+ biaya platform per order',
  'Analisis profit per produk',
  'Filter pesanan per status',
  'Export 12 format (CSV, Excel, PDF)',
  'Data 100% tersimpan lokal di komputer Anda',
]

const PLANS = [
  {
    name: 'Bulanan',
    price: 'Rp 20.000',
    period: 'per bulan',
    description: 'Pas untuk mulai mengelola pesanan Anda',
    cta: 'Beli Paket Bulanan',
    highlighted: false,
    badge: null,
    note: 'Bayar per bulan, bisa berhenti kapan saja',
  },
  {
    name: 'Tahunan',
    price: 'Rp 220.000',
    period: 'per tahun',
    description: 'Pilihan paling hemat untuk Anda yang serius',
    cta: 'Beli Paket Tahunan',
    highlighted: true,
    badge: 'Paling Populer',
    note: 'Hemat Rp 20.000 — bayar 11 bulan, dapat 12 bulan',
    equivalent: 'Setara Rp 18.333/bulan',
  },
]

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Harga Sederhana
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pilih paket yang sesuai dengan Anda
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tanpa biaya tersembunyi. Sekali bayar, langsung pakai semua fitur.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl items-center gap-8 lg:grid-cols-2">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl border bg-white p-8 shadow-sm transition-all ${
                plan.highlighted
                  ? 'border-blue-300 shadow-2xl shadow-blue-600/15 lg:scale-105'
                  : 'border-slate-200 hover:shadow-lg hover:shadow-slate-900/5'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                {plan.equivalent && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {plan.equivalent}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {plan.period}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">{plan.description}</p>

              {plan.note && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${
                    plan.highlighted
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <Zap className="h-4 w-4 flex-shrink-0" />
                  {plan.note}
                </div>
              )}

              <a
                href={waLink(plan.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 hover:brightness-110 hover:shadow-blue-600/40'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </a>

              <div className="mt-7 space-y-3.5">
                {PERKS.map((perk) => (
                  <div key={perk} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                        plan.highlighted ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 ${
                          plan.highlighted ? 'text-blue-600' : 'text-emerald-600'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-slate-600">{perk}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center text-sm text-slate-500"
        >
          Setelah pembayaran, Anda akan menerima key aktivasi. Masukkan key di
          halaman aplikasi untuk mulai menggunakan BisnisKu.
        </motion.p>
      </div>
    </section>
  )
}
