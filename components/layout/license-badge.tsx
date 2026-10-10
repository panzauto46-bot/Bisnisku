'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, CalendarClock } from 'lucide-react'

interface LicenseStatus {
  activated: boolean
  plan?: string
  planLabel?: string
  expiresAtLabel?: string
}

export function LicenseBadge() {
  const [status, setStatus] = useState<LicenseStatus | null>(null)

  useEffect(() => {
    fetch('/api/license/status')
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])

  if (!status || !status.activated) return null

  const isYearly = status.plan === 'yearly'

  return (
    <div
      className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm sm:flex"
      title={`Paket ${status.planLabel} berlaku sampai ${status.expiresAtLabel}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          isYearly ? 'bg-indigo-100' : 'bg-blue-100'
        }`}
      >
        <BadgeCheck
          className={`h-4 w-4 ${isYearly ? 'text-indigo-600' : 'text-blue-600'}`}
        />
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-slate-900">
          {status.planLabel}
        </p>
        <p className="flex items-center gap-1 text-[10px] text-slate-500">
          <CalendarClock className="h-2.5 w-2.5" />
          {status.expiresAtLabel}
        </p>
      </div>
    </div>
  )
}
