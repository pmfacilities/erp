import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'
import { formatBRL } from '@/lib/utils'
import { useAcertoSocios } from '@/lib/acertoSocios'
import { useStore } from '@/store/useStore'
import { ArrowDownRight, ArrowUpRight, Equal, Scale } from 'lucide-react'

interface Props {
  destacarSocio?: string // nome do sócio ativo (para highlight)
  compacto?: boolean
}

export function AcertoSociosCard({ destacarSocio, compacto }: Props) {
  const { linhas, totalAdiantado, cotaPorSocio } = useAcertoSocios()
  const sessao = useStore((s) => s.sessao)
  const highlight = destacarSocio || sessao?.nome || ''

  if (compacto) {
    const mine = linhas.find((l) => l.nome === highlight)
    if (!mine) return null
    return (
      <Card>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" /> Seu saldo no acerto entre sócios
              </div>
              <div className={`text-2xl font-bold mt-1 ${mine.saldo > 0 ? 'text-emerald-600' : mine.saldo < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {mine.saldo > 0 ? '+' : ''}{formatBRL(mine.saldo)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {mine.saldo > 0 && <>Você adiantou mais que sua cota — a <strong>receber</strong> dos outros</>}
                {mine.saldo < 0 && <>Você adiantou menos que sua cota — a <strong>repor</strong></>}
                {mine.saldo === 0 && <>Você está exatamente na cota justa</>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Adiantou</div>
              <div className="font-semibold text-slate-900">{formatBRL(mine.adiantou)}</div>
              <div className="text-xs text-slate-500 mt-1">Cota 25%</div>
              <div className="font-semibold text-slate-900">{formatBRL(mine.cotaJusta)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-brand-600" /> Acerto entre sócios
        </CardTitle>
        <CardDescription>
          Cálculo automático do rateio 25/25/25/25 sobre o que cada sócio adiantou do próprio bolso
          (despesas + pagamentos a colaboradores avulsos).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Total adiantado pelos sócios</div>
            <div className="text-xl font-bold text-slate-900">{formatBRL(totalAdiantado)}</div>
          </div>
          <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
            <div className="text-xs text-brand-700">Cota justa por sócio (25%)</div>
            <div className="text-xl font-bold text-brand-900">{formatBRL(cotaPorSocio)}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-xs text-emerald-700">Sócios a receber</div>
            <div className="text-xl font-bold text-emerald-900">
              {linhas.filter((l) => l.saldo > 0).length} de {linhas.length}
            </div>
          </div>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Sócio</TH>
              <TH>Adiantou (despesas)</TH>
              <TH>Adiantou (pagamentos)</TH>
              <TH>Total adiantado</TH>
              <TH>Cota justa</TH>
              <TH>Saldo</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <TBody>
            {linhas.map((l) => {
              const eu = l.nome === highlight
              return (
                <TR key={l.nome} className={eu ? 'bg-brand-50/60' : ''}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{l.nome}</div>
                      {eu && <Badge tone="brand" className="text-[10px]">VOCÊ</Badge>}
                    </div>
                  </TD>
                  <TD>{formatBRL(l.adiantouDespesas)}</TD>
                  <TD>{formatBRL(l.adiantouPagamentos)}</TD>
                  <TD className="font-semibold">{formatBRL(l.adiantou)}</TD>
                  <TD className="text-slate-500">{formatBRL(l.cotaJusta)}</TD>
                  <TD className={`font-bold ${l.saldo > 0 ? 'text-emerald-600' : l.saldo < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {l.saldo > 0 ? '+' : ''}{formatBRL(l.saldo)}
                  </TD>
                  <TD>
                    {l.saldo > 5 && <Badge tone="success"><ArrowUpRight className="h-3 w-3" /> a receber</Badge>}
                    {l.saldo < -5 && <Badge tone="danger"><ArrowDownRight className="h-3 w-3" /> a repor</Badge>}
                    {Math.abs(l.saldo) <= 5 && <Badge tone="neutral"><Equal className="h-3 w-3" /> equilibrado</Badge>}
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>

        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
          <strong>Como é calculado:</strong> somamos tudo que cada sócio pagou do próprio bolso (despesas
          + pagamentos individuais a colaboradores). Dividimos o total por 4 para obter a cota justa.
          A diferença é o saldo: positivo = sócio deve receber dos outros; negativo = sócio deve repor.
          Pagamentos marcados como "Rateado 4 sócios" já são considerados quitados e não entram no acerto.
        </div>
      </CardContent>
    </Card>
  )
}
