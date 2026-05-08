import { useState } from 'react'
import { Building2, Lock, User as UserIcon, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { useStore } from '@/store/useStore'

export function Login() {
  const login = useStore((s) => s.login)
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    const r = login(identificador, senha)
    setLoading(false)
    if (!r.ok) setErro(r.erro || 'Erro ao entrar')
  }

  const preencherDemo = (l: string, s: string) => { setIdentificador(l); setSenha(s); setErro(null) }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Fundo gradiente */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900" />
      <div className="fixed inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #1e4ef5 0%, transparent 40%), radial-gradient(circle at 75% 70%, #10b981 0%, transparent 40%)' }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg mb-3">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PS Facilities Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Sistema de Gestão · acesse com suas credenciais</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Login ou e-mail</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  autoFocus
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  className="pl-9"
                  placeholder="silva, david, kerol..."
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={mostrar ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-9 pr-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrar((m) => !m)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!identificador || !senha}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Credenciais de acesso (sócios)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                ['silva',  'silva123',  'Jonathan da Silva'],
                ['david',  'david123',  'David Souza'],
                ['kerol',  'kerol123',  'Márcio Kerol'],
                ['junior', 'junior123', 'Junior Alamar'],
              ].map(([l, s, n]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => preencherDemo(l, s)}
                  className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 text-left"
                >
                  <div className="text-[11px] text-slate-500 font-mono">{l} / {s}</div>
                  <div className="text-xs font-medium text-slate-700 truncate">{n}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-3 text-center">
              Clique em qualquer credencial para preencher automaticamente
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          © PS Facilities · Todos os direitos reservados
        </div>
      </div>
    </div>
  )
}
