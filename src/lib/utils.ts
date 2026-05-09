import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: any) {
  const val = Number(value) || 0
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(value: any, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return '—'
  
  try {
    let d: Date
    if (typeof value === 'string') {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
      d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
    } else if (value instanceof Date) {
      d = value
    } else {
      return '—'
    }

    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('pt-BR', opts)
  } catch (e) {
    return '—'
  }
}

export function formatDateTime(value: any) {
  if (!value) return '—'
  try {
    const d = typeof value === 'string' ? new Date(value) : value
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch (e) {
    return '—'
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function sleep(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}
