// =====================================================
// Acerto entre sócios
// Calcula quem adiantou quanto (despesas + pagamentos de colaboradores
// avulsos pagos individualmente), qual a cota justa (rateio 25/25/25/25)
// e o saldo de cada sócio (a receber ou a pagar).
// =====================================================

import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import type { Despesa, PagamentoAvulso } from '@/data/mockExtras'

export interface AcertoSocio {
  nome: string
  adiantouDespesas: number
  adiantouPagamentos: number
  adiantou: number    // total adiantado pessoalmente
  cotaJusta: number   // quanto DEVERIA ter pago se rateado 25%
  saldo: number       // positivo = deve RECEBER, negativo = deve PAGAR
}

// Mapeamento nome completo ↔ nome curto usado em PagamentoAvulso.quemPagou
const nomeCurto: Record<string, string> = {
  'Jonathan da Silva': 'Jonathan',
  'David Souza': 'David',
  'Márcio Kerol': 'Kerol',
  'Junior Alamar': 'Junior',
}

export function calcularAcerto(socios: { nome: string }[], despesas: Despesa[], pagamentos: PagamentoAvulso[]): {
  linhas: AcertoSocio[]
  totalAdiantado: number
  cotaPorSocio: number
} {
  const linhas: AcertoSocio[] = socios.map((s) => {
    const curto = nomeCurto[s.nome] || s.nome
    const adiantouDespesas = despesas
      .filter((d) => d.quemComprou === s.nome)
      .reduce((a, d) => a + d.valor, 0)
    const adiantouPagamentos = pagamentos
      .filter((p) => p.quemPagou === curto)
      .reduce((a, p) => a + p.valor, 0)
    const adiantou = adiantouDespesas + adiantouPagamentos
    return { nome: s.nome, adiantouDespesas, adiantouPagamentos, adiantou, cotaJusta: 0, saldo: 0 }
  })

  const totalAdiantado = linhas.reduce((a, l) => a + l.adiantou, 0)
  const cotaPorSocio = socios.length > 0 ? totalAdiantado / socios.length : 0

  linhas.forEach((l) => {
    l.cotaJusta = cotaPorSocio
    l.saldo = +(l.adiantou - cotaPorSocio).toFixed(2)
  })

  return { linhas, totalAdiantado, cotaPorSocio }
}

export function useAcertoSocios() {
  const despesas = useStore((s) => s.despesas)
  const pagamentos = useStore((s) => s.pagamentosAvulsos)
  const empresa = useStore((s) => s.empresa)
  const proLabore = useStore((s) => s.proLabore)

  return useMemo(
    () => calcularAcerto(empresa.socios.slice(0, proLabore.numSocios), despesas, pagamentos),
    [despesas, pagamentos, empresa.socios, proLabore.numSocios],
  )
}
