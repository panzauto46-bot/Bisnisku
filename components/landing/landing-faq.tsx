'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Apakah data saya aman?',
    a: 'Sangat aman. BisnisKu 100% berjalan di komputer Anda — tidak ada data yang dikirim ke server kami. Semua file Excel dan database tersimpan lokal di perangkat Anda sendiri.',
  },
  {
    q: 'Apakah saya perlu API marketplace?',
    a: 'Tidak. BisnisKu membaca langsung dari file Excel export yang sudah Anda download dari marketplace. Tidak ada setting API, tidak ada koneksi ke toko Anda, tidak ada risiko.',
  },
  {
    q: 'Bagaimana cara membeli?',
    a: 'Klik tombol "Beli" di paket yang Anda pilih, hubungi kami via WhatsApp, lakukan pembayaran, dan Anda akan menerima key aktivasi. Masukkan key tersebut di aplikasi — selesai.',
  },
  {
    q: 'File Excel dari marketplace mana saja yang didukung?',
    a: 'Semua file export standar marketplace: file daftar pesanan dan file penghasilan/saldo penjual. Cukup upload, dan BisnisKu otomatis membaca kolom-kolomnya.',
  },
  {
    q: 'Apa beda paket bulanan dan tahunan?',
    a: 'Fiturnya sama persis. Paket tahunan lebih hemat: Anda hanya membayar Rp 220.000 untuk 12 bulan (setara Rp 18.333/bulan), hemat Rp 20.000 dibanding langganan bulanan.',
  },
  {
    q: 'Apakah key aktivasi bisa dipakai di komputer lain?',
    a: 'Satu key berlaku untuk satu komputer. Jika Anda mengganti komputer, hubungi kami dan kami bantu memindahkan key Anda.',
  },
]

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-700">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pertanyaan yang sering ditanyakan
          </h2>
        </motion.div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100"
                  >
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
