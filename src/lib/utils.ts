import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  let d: Date
  if (typeof value === 'string') {
    // "YYYY-MM-DD" puro é interpretado como UTC pelo Date; força local para não voltar 1 dia no fuso -3
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
  } else {
    d = value
  }
  return d.toLocaleDateString('pt-BR', opts)
}

export function formatDateTime(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function sleep(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}
