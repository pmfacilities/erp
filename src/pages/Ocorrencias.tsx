import { useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { useStore } from '@/store/useStore'
import { formatDateTime } from '@/lib/utils'
import { Plus, AlertTriangle, Camera, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import type { Ocorrencia } from '@/data/mockData'

const critTone: Record<string, any> = { baixa: 'neutral', media: 'info', alta: 'warning', critica: 'danger' }
const statusTone: Record<string, any> = { aberta: 'danger', em_andamento: 'warning', resolvida: 'success' }

function setorDaCriticidade(c: string): string {
  if (c === 'critica') return 'Gerência Operacional'
  if (c === 'alta') return 'Coordenação Operacional'
  if (c === 'media') return 'Supervisão'
  return 'Encarregado'
}

export function Ocorrencias() {
  const { ocorrencias, contratos, empresa, addOcorrencia, updateOcorrencia, pushToast } = useStore()
  const [filtroStatus, setFiltroStatus] = useState('todas')
  const [filtroCrit, setFiltroCrit] = useState('todas')
  const [open, setOpen] = useState(false)
  const [detalhe, setDetalhe] = useState<Ocorrencia | null>(null)

  const filtradas = useMemo(() =>
    ocorrencias.filter((o) => {
      const s = filtroStatus === 'todas' || o.status === filtroStatus
      const c = filtroCrit === 'todas' || o.criticidade === filtroCrit
      return s && c
    }).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)), [ocorrencias, filtroStatus, filtroCrit],
  )

  const stats = {
    abertas: ocorrencias.filter((o) => o.status === 'aberta').length,
    andamento: ocorrencias.filter((o) => o.status === 'em_andamento').length,
    resolvidas: ocorrencias.filter((o) => o.status === 'resolvida').length,
    criticas: ocorrencias.filter((o) => o.criticidade === 'critica' && o.status !== 'resolvida').length,
  }

  return (
    <>
      <Header title="Ocorrências" subtitle={`${ocorrencias.length} registradas · ${stats.criticas} críticas abertas`} />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent><div className="text-xs text-slate-500">Abertas</div><div className="text-2xl font-bold text-red-600">{stats.abertas}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Em andamento</div><div className="text-2xl font-bold text-amber-600">{stats.andamento}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Resolvidas</div><div className="text-2xl font-bold text-emerald-600">{stats.resolvidas}</div></CardContent></Card>
          <Card><CardContent><div className="text-xs text-slate-500">Críticas abertas</div><div className="text-2xl font-bold text-red-700">{stats.criticas}</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-3 items-center">
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-48">
              <option value="todas">Todos os status</option>
              <option value="aberta">Aberta</option>
              <option value="em_andamento">Em andamento</option>
              <option value="resolvida">Resolvida</option>
            </Select>
            <Select value={filtroCrit} onChange={(e) => setFiltroCrit(e.target.value)} className="sm:w-48">
              <option value="todas">Toda criticidade</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </Select>
            <div className="flex-1" />
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Registrar ocorrência</Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((o) => {
            const ct = contratos.find((c) => c.id === o.contratoId)
            return (
              <Card key={o.id} className="cursor-pointer hover:shadow-md" onClick={() => setDetalhe(o)}>
                <CardContent>
                  <div className="flex items-start justify-between mb-2">
                    <Badge tone={critTone[o.criticidade]}>
                      <AlertTriangle className="h-3 w-3" /> {o.criticidade}
                    </Badge>
                    <Badge tone={statusTone[o.status]}>{o.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="font-semibold text-slate-900">{o.titulo}</div>
                  <div className="text-sm text-slate-600 mt-1 line-clamp-2">{o.descricao}</div>
                  <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                    <div>{ct?.titulo} · {o.postoNome}</div>
                    <div>Reportada por: {o.reportadaPor}</div>
                    <div>{formatDateTime(o.criadaEm)}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <NovaOcorrenciaDialog
        open={open} onClose={() => setOpen(false)}
        onSave={(o) => {
          addOcorrencia(o)
          // Notificação: setor responsável + todos os sócios
          const setor = setorDaCriticidade(o.criticidade)
          const ct = contratos.find((c) => c.id === o.contratoId)
          pushToast({ titulo: 'Ocorrência registrada', descricao: `Notificando ${setor}`, tipo: 'success' })
          setTimeout(() => pushToast({
            titulo: `📢 ${setor} notificado`,
            descricao: `${o.titulo} · ${ct?.titulo || ''}`,
            tipo: 'info',
          }), 450)
          empresa.socios.forEach((s, idx) => {
            setTimeout(() => pushToast({
              titulo: `🔔 ${s.nome}`,
              descricao: `Ocorrência ${o.criticidade.toUpperCase()} no posto ${o.postoNome}`,
              tipo: o.criticidade === 'critica' ? 'error' : 'info',
            }), 900 + idx * 250)
          })
          setOpen(false)
        }}
      />
      <OcorrenciaDetalhe
        ocorrencia={detalhe} onClose={() => setDetalhe(null)}
        onUpdate={(id, p) => { updateOcorrencia(id, p); pushToast({ titulo: 'Atualizada', tipo: 'success' }) }}
      />
    </>
  )
}

function NovaOcorrenciaDialog({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: (o: Omit<Ocorrencia, 'id' | 'criadaEm'>) => void }) {
  const { contratos } = useStore()
  const [f, setF] = useState<Omit<Ocorrencia, 'id' | 'criadaEm'>>({
    contratoId: contratos[0]?.id || '', postoNome: '', titulo: '', descricao: '',
    criticidade: 'media', status: 'aberta', reportadaPor: 'Jonathan da Silva',
  })
  const ct = contratos.find((c) => c.id === f.contratoId)
  const [foto, setFoto] = useState<string>('')
  return (
    <Dialog open={open} onClose={onClose} title="Registrar ocorrência" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ ...f, foto: foto || undefined })} disabled={!f.titulo || !f.postoNome}>Registrar</Button>
      </>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Contrato</Label>
          <Select value={f.contratoId} onChange={(e) => setF((x) => ({ ...x, contratoId: e.target.value, postoNome: '' }))}>
            {contratos.map((c) => <option key={c.id} value={c.id}>{c.numero} — {c.titulo}</option>)}
          </Select>
        </div>
        <div>
          <Label required>Posto</Label>
          <Select value={f.postoNome} onChange={(e) => setF((x) => ({ ...x, postoNome: e.target.value }))}>
            <option value="">—</option>
            {ct?.postos.map((p) => <option key={p.nome}>{p.nome}</option>)}
          </Select>
        </div>
        <div className="col-span-2">
          <Label required>Título</Label>
          <Input value={f.titulo} onChange={(e) => setF((x) => ({ ...x, titulo: e.target.value }))} placeholder="Resumo curto..." />
        </div>
        <div className="col-span-2">
          <Label>Descrição</Label>
          <Textarea rows={4} value={f.descricao} onChange={(e) => setF((x) => ({ ...x, descricao: e.target.value }))} />
        </div>
        <div>
          <Label>Criticidade</Label>
          <Select value={f.criticidade} onChange={(e) => setF((x) => ({ ...x, criticidade: e.target.value as any }))}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </Select>
        </div>
        <div>
          <Label>Reportada por</Label>
          <Input value={f.reportadaPor} onChange={(e) => setF((x) => ({ ...x, reportadaPor: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>Foto (simulada)</Label>
          <button
            type="button"
            onClick={() => setFoto(foto ? '' : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600')}
            className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50"
          >
            {foto ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <ImageIcon className="h-5 w-5" /> Foto anexada (clique para remover)
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Camera className="h-5 w-5" /> Anexar foto
              </div>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

function OcorrenciaDetalhe({
  ocorrencia, onClose, onUpdate,
}: {
  ocorrencia: Ocorrencia | null; onClose: () => void
  onUpdate: (id: string, patch: Partial<Ocorrencia>) => void
}) {
  const { contratos } = useStore()
  if (!ocorrencia) return null
  const ct = contratos.find((c) => c.id === ocorrencia.contratoId)
  return (
    <Dialog open onClose={onClose} title={ocorrencia.titulo} description={`${ct?.titulo} · ${ocorrencia.postoNome}`} size="lg"
      footer={<>
        {ocorrencia.status !== 'resolvida' && (
          <>
            {ocorrencia.status === 'aberta' && (
              <Button variant="outline" onClick={() => onUpdate(ocorrencia.id, { status: 'em_andamento' })}>
                Iniciar atendimento
              </Button>
            )}
            <Button variant="success" onClick={() => onUpdate(ocorrencia.id, { status: 'resolvida', resolvidaEm: new Date().toISOString() })}>
              <CheckCircle2 className="h-4 w-4" /> Marcar resolvida
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </>}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={critTone[ocorrencia.criticidade]}>
            <AlertTriangle className="h-3 w-3" /> {ocorrencia.criticidade}
          </Badge>
          <Badge tone={statusTone[ocorrencia.status]}>{ocorrencia.status.replace('_', ' ')}</Badge>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Descrição</div>
          <div className="text-sm">{ocorrencia.descricao || '—'}</div>
        </div>
        {ocorrencia.foto && (
          <div>
            <div className="text-xs text-slate-500 mb-1">Foto</div>
            <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-slate-400" />
              <span className="ml-2 text-slate-500 text-sm">Imagem anexada</span>
            </div>
          </div>
        )}
        <div className="text-xs text-slate-500 space-y-0.5">
          <div>Reportada por: <span className="text-slate-700">{ocorrencia.reportadaPor}</span></div>
          <div>Criada em: <span className="text-slate-700">{formatDateTime(ocorrencia.criadaEm)}</span></div>
          {ocorrencia.resolvidaEm && <div>Resolvida em: <span className="text-slate-700">{formatDateTime(ocorrencia.resolvidaEm)}</span></div>}
        </div>
      </div>
    </Dialog>
  )
}
