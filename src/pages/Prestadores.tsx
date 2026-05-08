import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Table, THead, TBody, TR, TH, TD, EmptyState } from '@/components/ui/Table'
import { useStore } from '@/store/useStore'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, Search, Pencil, Trash2, Briefcase, Phone, Mail } from 'lucide-react'
import type { Prestador } from '@/data/mockExtras'

const SEGMENTOS: Prestador['segmentos'][number][] = ['Limpeza', 'Portaria', 'Manutenção', 'Segurança', 'Jardinagem', 'Copa', 'Outros']
const relTone: Record<Prestador['relacionamento'], any> = {
  parceiro: 'success', qualificado: 'info', em_contato: 'warning', descartado: 'neutral',
}

export function Prestadores() {
  const { prestadores, addPrestador, updatePrestador, removePrestador, pushToast } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroSeg, setFiltroSeg] = useState('todos')
  const [filtroRel, setFiltroRel] = useState('todos')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Prestador | null>(null)

  const filtrados = useMemo(() =>
    prestadores.filter((p) => {
      const b = [p.razaoSocial, p.nomeFantasia, p.cnpj, p.cidade].some((v) => v.toLowerCase().includes(busca.toLowerCase()))
      const s = filtroSeg === 'todos' || p.segmentos.includes(filtroSeg as any)
      const r = filtroRel === 'todos' || p.relacionamento === filtroRel
      return b && s && r
    }), [prestadores, busca, filtroSeg, filtroRel])

  return (
    <>
      <Header title="Prestadores de serviço" subtitle={`${prestadores.length} parceiros cadastrados — empresas que concorreram com a PSF e podem ser contratadas`} />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar por nome, CNPJ..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroSeg} onChange={(e) => setFiltroSeg(e.target.value)} className="w-44">
              <option value="todos">Todos os segmentos</option>
              {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={filtroRel} onChange={(e) => setFiltroRel(e.target.value)} className="w-44">
              <option value="todos">Todo relacionamento</option>
              <option value="parceiro">Parceiro</option>
              <option value="qualificado">Qualificado</option>
              <option value="em_contato">Em contato</option>
              <option value="descartado">Descartado</option>
            </Select>
            <Button onClick={() => { setEdit(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo prestador</Button>
          </CardContent>
        </Card>

        {filtrados.length === 0 ? (
          <EmptyState title="Nenhum prestador encontrado" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((p) => (
              <Card key={p.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{p.nomeFantasia}</div>
                      <div className="text-xs text-slate-500 truncate">{p.razaoSocial}</div>
                    </div>
                    <Badge tone={relTone[p.relacionamento]}>{p.relacionamento.replace('_', ' ')}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.segmentos.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="text-slate-700 font-medium">{p.contatoNome}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3" /> {p.telefone}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate"><Mail className="h-3 w-3" /> {p.email}</div>
                    <div className="text-xs text-slate-500">{p.cidade}/{p.uf}</div>
                  </div>
                  {p.valorMinutaProposta != null && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-500">Valor última proposta apresentada</div>
                      <div className="font-semibold text-slate-900">{formatBRL(p.valorMinutaProposta)}/mês</div>
                    </div>
                  )}
                  {p.observacao && (
                    <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600">{p.observacao}</div>
                  )}
                  {p.ultimoContato && <div className="mt-2 text-xs text-slate-500">Último contato: {formatDate(p.ultimoContato)}</div>}
                  <div className="mt-3 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEdit(p); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Remover ${p.nomeFantasia}?`)) { removePrestador(p.id); pushToast({ titulo: 'Removido', tipo: 'success' }) }
                    }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PrestadorDialog
        open={open} onClose={() => setOpen(false)} prestador={edit}
        onSave={(data) => {
          if (edit) { updatePrestador(edit.id, data); pushToast({ titulo: 'Atualizado', tipo: 'success' }) }
          else { addPrestador(data); pushToast({ titulo: 'Prestador cadastrado', tipo: 'success' }) }
          setOpen(false)
        }}
      />
    </>
  )
}

function PrestadorDialog({
  open, onClose, prestador, onSave,
}: {
  open: boolean; onClose: () => void; prestador: Prestador | null
  onSave: (p: Omit<Prestador, 'id'>) => void
}) {
  const [f, setF] = useState<Omit<Prestador, 'id'>>(() => prestador || {
    razaoSocial: '', nomeFantasia: '', cnpj: '', segmentos: ['Limpeza'],
    cidade: '', uf: 'RJ', contatoNome: '', telefone: '', email: '',
    relacionamento: 'em_contato',
  })
  useMemo(() => setF(prestador || {
    razaoSocial: '', nomeFantasia: '', cnpj: '', segmentos: ['Limpeza'],
    cidade: '', uf: 'RJ', contatoNome: '', telefone: '', email: '',
    relacionamento: 'em_contato',
  }), [prestador, open])
  const set = <K extends keyof typeof f>(k: K, v: any) => setF((s) => ({ ...s, [k]: v }))

  const toggleSeg = (s: any) => set('segmentos', f.segmentos.includes(s) ? f.segmentos.filter((x) => x !== s) : [...f.segmentos, s])

  return (
    <Dialog open={open} onClose={onClose} title={prestador ? 'Editar prestador' : 'Novo prestador'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(f)} disabled={!f.nomeFantasia || !f.cnpj}>Salvar</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label required>Razão Social</Label><Input value={f.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} /></div>
        <div><Label required>Nome Fantasia</Label><Input value={f.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} /></div>
        <div><Label required>CNPJ</Label><Input value={f.cnpj} onChange={(e) => set('cnpj', e.target.value)} /></div>
        <div className="col-span-2">
          <Label>Segmentos de atuação</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SEGMENTOS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSeg(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${f.segmentos.includes(s) ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-300 text-slate-700'}`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div><Label>Cidade</Label><Input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} /></div>
        <div><Label>UF</Label>
          <Select value={f.uf} onChange={(e) => set('uf', e.target.value)}>
            {['RJ', 'SP', 'MG', 'ES'].map((u) => <option key={u}>{u}</option>)}
          </Select>
        </div>
        <div><Label>Contato responsável</Label><Input value={f.contatoNome} onChange={(e) => set('contatoNome', e.target.value)} /></div>
        <div><Label>Telefone</Label><Input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} /></div>
        <div className="col-span-2"><Label>E-mail</Label><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><Label>Valor de proposta (R$/mês)</Label><Input type="number" step="0.01" value={f.valorMinutaProposta || 0} onChange={(e) => set('valorMinutaProposta', Number(e.target.value) || undefined)} /></div>
        <div>
          <Label>Relacionamento</Label>
          <Select value={f.relacionamento} onChange={(e) => set('relacionamento', e.target.value)}>
            <option value="parceiro">Parceiro</option>
            <option value="qualificado">Qualificado</option>
            <option value="em_contato">Em contato</option>
            <option value="descartado">Descartado</option>
          </Select>
        </div>
        <div className="col-span-2"><Label>Observações</Label><Textarea rows={2} value={f.observacao || ''} onChange={(e) => set('observacao', e.target.value)} /></div>
        <div><Label>Último contato</Label><Input type="date" value={f.ultimoContato || ''} onChange={(e) => set('ultimoContato', e.target.value || undefined)} /></div>
      </div>
    </Dialog>
  )
}
