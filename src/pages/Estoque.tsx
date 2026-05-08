import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Search, ArrowDownUp, AlertTriangle, Package } from 'lucide-react'
import type { ItemEstoque } from '@/data/mockData'

export function Estoque() {
  const { estoque, contratos, addItemEstoque, movimentarEstoque, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroCat, setFiltroCat] = useState('todas')
  const [openNovo, setOpenNovo] = useState(false)
  const [movItem, setMovItem] = useState<ItemEstoque | null>(null)

  const categorias = useMemo(() => Array.from(new Set(estoque.map((i) => i.categoria))), [estoque])

  const lista = useMemo(() =>
    estoque.filter((i) => {
      const b = [i.sku, i.nome].some((v) => v.toLowerCase().includes(busca.toLowerCase()))
      const c = filtroCat === 'todas' || i.categoria === filtroCat
      return b && c
    }), [estoque, busca, filtroCat],
  )

  const baixos = estoque.filter((i) => i.quantidade < i.estoqueMinimo)
  const valorTotal = estoque.reduce((a, i) => a + i.quantidade * i.custoUnitario, 0)

  return (
    <>
      <Header title="Estoque" subtitle={`${estoque.length} itens · ${formatBRL(valorTotal)} em estoque`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent><div className="text-xs text-slate-500">Total itens</div><div className="text-2xl font-bold text-slate-900">{estoque.length}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Valor em estoque</div><div className="text-2xl font-bold text-slate-900">{formatBRL(valorTotal)}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Abaixo do mínimo</div><div className="text-2xl font-bold text-red-600">{baixos.length}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Categorias</div><div className="text-2xl font-bold text-slate-900">{categorias.length}</div></CardContent></Card>
        </div>

        {baixos.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-amber-900">Itens abaixo do estoque mínimo</div>
                <div className="text-sm text-amber-800 mt-1">
                  {baixos.map((i) => i.nome).slice(0, 4).join(', ')}{baixos.length > 4 && ` e mais ${baixos.length - 4}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="SKU ou nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="sm:w-44">
              <option value="todas">Todas categorias</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Button onClick={() => setOpenNovo(true)}><Plus className="h-4 w-4" /> Novo item</Button>
          </CardContent>
        </Card>

        <Card className="p-0">
          {lista.length === 0 ? (
            <EmptyState title="Nenhum item" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Item</TH>
                  <TH>Categoria</TH>
                  <TH>Qtd / Mínimo</TH>
                  <TH>Custo unit.</TH>
                  <TH>Valor total</TH>
                  <TH>Últ. mov.</TH>
                  <TH className="text-right">Ações</TH>
                </TR>
              </THead>
              <TBody>
                {lista.map((i) => {
                  const baixo = i.quantidade < i.estoqueMinimo
                  return (
                    <TR key={i.id}>
                      <TD className="font-mono text-xs">{i.sku}</TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="h-3.5 w-3.5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{i.nome}</div>
                            <div className="text-xs text-slate-500">{i.unidade}</div>
                          </div>
                        </div>
                      </TD>
                      <TD><Badge tone="neutral">{i.categoria}</Badge></TD>
                      <TD>
                        <div className={`font-semibold ${baixo ? 'text-red-600' : 'text-slate-900'}`}>{i.quantidade}</div>
                        <div className="text-xs text-slate-500">mín {i.estoqueMinimo}</div>
                      </TD>
                      <TD>{formatBRL(i.custoUnitario)}</TD>
                      <TD className="font-medium">{formatBRL(i.quantidade * i.custoUnitario)}</TD>
                      <TD className="text-xs">{formatDate(i.ultimaMovimentacao)}</TD>
                      <TD className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setMovItem(i)}>
                          <ArrowDownUp className="h-3.5 w-3.5" /> Movimentar
                        </Button>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <NovoItemDialog
        open={openNovo} onClose={() => setOpenNovo(false)}
        onSave={(i) => {
          addItemEstoque(i)
          pushToast({ titulo: 'Item criado', descricao: i.nome, tipo: 'success' })
          setOpenNovo(false)
        }}
      />
      <MovimentacaoDialog
        item={movItem} contratos={contratos} onClose={() => setMovItem(null)}
        onMovimentar={(mov) => {
          movimentarEstoque(mov)
          pushToast({ titulo: 'Movimentação registrada', tipo: 'success' })
          setMovItem(null)
        }}
      />
    </>
  )
}

function NovoItemDialog({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: (i: Omit<ItemEstoque, 'id'>) => void }) {
  const [f, setF] = useState<Omit<ItemEstoque, 'id'>>({
    sku: '', nome: '', categoria: 'Química', unidade: 'Unidade', quantidade: 0,
    estoqueMinimo: 0, custoUnitario: 0, local: 'Almox. Central',
    ultimaMovimentacao: new Date().toISOString().slice(0, 10),
  })
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))
  return (
    <Dialog open={open} onClose={onClose} title="Novo item de estoque" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => onSave(f)} disabled={!f.sku || !f.nome}>Criar</Button></>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><Label required>SKU</Label><Input value={f.sku} onChange={(e) => set('sku', e.target.value)} /></div>
        <div><Label>Unidade</Label><Select value={f.unidade} onChange={(e) => set('unidade', e.target.value)}>{['Unidade', 'Par', 'Galão', 'Pacote', 'Fardo', 'Caixa'].map((u) => <option key={u}>{u}</option>)}</Select></div>
        <div className="col-span-2"><Label required>Nome</Label><Input value={f.nome} onChange={(e) => set('nome', e.target.value)} /></div>
        <div><Label>Categoria</Label><Select value={f.categoria} onChange={(e) => set('categoria', e.target.value)}>{['Química', 'Papelaria', 'EPI', 'Uniforme', 'Ferramenta'].map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label>Local</Label><Input value={f.local} onChange={(e) => set('local', e.target.value)} /></div>
        <div><Label>Quantidade inicial</Label><Input type="number" value={f.quantidade} onChange={(e) => set('quantidade', Number(e.target.value))} /></div>
        <div><Label>Estoque mínimo</Label><Input type="number" value={f.estoqueMinimo} onChange={(e) => set('estoqueMinimo', Number(e.target.value))} /></div>
        <div className="col-span-2"><Label>Custo unitário</Label><Input type="number" step="0.01" value={f.custoUnitario} onChange={(e) => set('custoUnitario', Number(e.target.value))} /></div>
      </div>
    </Dialog>
  )
}

function MovimentacaoDialog({
  item, contratos, onClose, onMovimentar,
}: {
  item: ItemEstoque | null; contratos: any[]
  onClose: () => void
  onMovimentar: (mov: { itemId: string; tipo: 'entrada' | 'saida'; quantidade: number; contratoId?: string; responsavel: string; data: string; observacao?: string }) => void
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida')
  const [qtd, setQtd] = useState(1)
  const [contratoId, setContratoId] = useState('')
  const [obs, setObs] = useState('')
  if (!item) return null
  return (
    <Dialog open onClose={onClose} title={`Movimentar: ${item.nome}`} description={`Estoque atual: ${item.quantidade} ${item.unidade}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onMovimentar({
          itemId: item.id, tipo, quantidade: qtd,
          contratoId: tipo === 'saida' ? contratoId || undefined : undefined,
          responsavel: 'Almoxarife Central', data: new Date().toISOString().slice(0, 10),
          observacao: obs,
        })} disabled={qtd <= 0}>
          Registrar
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setTipo('entrada')} className={`p-3 rounded-lg border-2 text-left ${tipo === 'entrada' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
            <div className="font-semibold text-emerald-700">Entrada</div>
            <div className="text-xs text-slate-500">Recebimento</div>
          </button>
          <button onClick={() => setTipo('saida')} className={`p-3 rounded-lg border-2 text-left ${tipo === 'saida' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
            <div className="font-semibold text-red-700">Saída</div>
            <div className="text-xs text-slate-500">Consumo</div>
          </button>
        </div>
        <div>
          <Label required>Quantidade</Label>
          <Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} />
        </div>
        {tipo === 'saida' && (
          <div>
            <Label>Vincular ao contrato</Label>
            <Select value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
              <option value="">— consumo interno —</option>
              {contratos.filter((c: any) => c.status === 'ativo').map((c: any) => (
                <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label>Observação</Label>
          <Input value={obs} onChange={(e) => setObs(e.target.value)} />
        </div>
      </div>
    </Dialog>
  )
}
