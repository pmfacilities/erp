import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequirePerfil } from './components/RequirePerfil'
import { useStore } from './store/useStore'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Contratos } from './pages/Contratos'
import { Clientes } from './pages/Clientes'
import { Operacional } from './pages/Operacional'
import { Escalas } from './pages/Escalas'
import { Funcionarios } from './pages/Funcionarios'
import { Financeiro } from './pages/Financeiro'
import { Estoque } from './pages/Estoque'
import { Ocorrencias } from './pages/Ocorrencias'
import { Relatorios } from './pages/Relatorios'
import { Configuracoes } from './pages/Configuracoes'
import { Despesas } from './pages/Despesas'
import { ServicosAvulsos } from './pages/ServicosAvulsos'
import { Prestadores } from './pages/Prestadores'
import { Curriculos } from './pages/Curriculos'
import { Concorrentes } from './pages/Concorrentes'
import { SalaSocios } from './pages/SalaSocios'
import { PainelSocio } from './pages/PainelSocio'
import { InitializeStore } from './components/InitializeStore'

export default function App() {
  const autenticado = useStore((s) => s.autenticado)
  const sessao = useStore((s) => s.sessao)

  // Guarda DUPLA: precisa estar autenticado E ter sessão válida
  if (!autenticado || !sessao) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <InitializeStore />
      <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Rotas restritas à Sala dos Sócios */}
        <Route path="/socios" element={<RequirePerfil perfisPermitidos={['socio_gestor']}><SalaSocios /></RequirePerfil>} />
        <Route path="/socios/painel" element={<RequirePerfil perfisPermitidos={['socio_gestor', 'socio']}><PainelSocio /></RequirePerfil>} />
        <Route path="/socios/despesas" element={<RequirePerfil perfisPermitidos={['socio_gestor', 'socio']}><Despesas /></RequirePerfil>} />
        <Route path="/socios/pagamentos" element={<RequirePerfil perfisPermitidos={['socio_gestor', 'socio']}><ServicosAvulsos /></RequirePerfil>} />

        {/* Rotas gerais */}
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/servicos-avulsos" element={<ServicosAvulsos />} />
        <Route path="/prestadores" element={<Prestadores />} />
        <Route path="/concorrentes" element={<Concorrentes />} />
        <Route path="/operacional" element={<Operacional />} />
        <Route path="/escalas" element={<Escalas />} />
        <Route path="/ocorrencias" element={<Ocorrencias />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/curriculos" element={<Curriculos />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
    </>
  )
}
