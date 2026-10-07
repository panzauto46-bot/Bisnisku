import { format, parseISO, isValid } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * Parse date string from marketplace export (e.g. "2026-09-06 00:13")
 */
export function parseMarketplaceDate(dateString: string | null | undefined): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  // Handle format: "2026-09-06 00:13"
  const cleaned = dateString.trim()

  // Try ISO format first
  const parsed = parseISO(cleaned.replace(' ', 'T'))
  if (isValid(parsed)) {
    return parsed
  }

  return null
}

/**
 * Format date to Indonesian format: "6 Sep 2026"
 */
export function formatDate(
  dateString: string | null | undefined,
  formatStr: string = 'd MMM yyyy'
): string {
  const date = parseMarketplaceDate(dateString)

  if (!date) {
    return '-'
  }

  return format(date, formatStr, { locale: idLocale })
}

/**
 * Format date with time: "6 Sep 2026, 00:13"
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'd MMM yyyy, HH:mm')
}

/**
 * Get relative time (e.g. "2 hari yang lalu")
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  const date = parseMarketplaceDate(dateString)

  if (!date) {
    return '-'
  }

  const now = new Date()
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffInDays === 0) return 'Hari ini'
  if (diffInDays === 1) return 'Kemarin'
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu yang lalu`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} bulan yang lalu`
  return `${Math.floor(diffInDays / 365)} tahun yang lalu`
}

/**
 * Check if order is urgent (must be shipped within 24h)
 */
export function isUrgentOrder(deadlineString: string | null | undefined): boolean {
  const deadline = parseMarketplaceDate(deadlineString)

  if (!deadline) return false

  const now = new Date()
  const diffInHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

  return diffInHours <= 24
}
