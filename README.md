# PSFM — PS Facilities Manager

Sistema SaaS de gestão para empresas de facilities (limpeza, portaria, manutenção, jardinagem, segurança predial). MVP navegável com dados simulados.

## Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **Estilização:** TailwindCSS 3
- **Estado:** Zustand
- **Roteamento:** React Router 6
- **Gráficos:** Recharts
- **Ícones:** lucide-react

## Como rodar

```bash
# Instalar dependências
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Credenciais de acesso (sócios administradores)

| Login  | Senha      | Nome                |
|--------|------------|---------------------|
| silva  | silva123   | Jonathan da Silva   |
| david  | david123   | David Souza         |
| kerol  | kerol123   | Márcio Kerol        |
| junior | junior123  | Junior Alamar       |

Usuários administrativos de exemplo:
- `paula / paula123` — RH
- `shopping / cliente123` — Portal do Cliente

Sócios podem criar novos usuários (Comercial, RH, Operacional, Financeiro, Cliente) em **Configurações → Usuários**.

## Estrutura de pastas

```
psfm-app/
├── src/
│   ├── components/      # UI (Button, Card, Dialog, Sidebar, Header, AcertoSociosCard, etc.)
│   │   └── ui/          # Primitivos de UI
│   ├── pages/           # 18 páginas (Dashboard, Contratos, SalaSocios, PainelSocio, ...)
│   ├── store/           # Zustand store (auth + CRUD)
│   ├── data/            # Mock data (clientes, contratos, despesas, pagamentos, etc.)
│   ├── lib/             # Utilitários (formatBRL, caixaConsolidado, acertoSocios)
│   ├── App.tsx          # Rotas + auth gate
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Módulos principais

**Comercial**
- Contratos (CRUD + rentabilidade)
- Clientes (CRUD)
- Serviços Avulsos (jobs pontuais Fase 1)
- Prestadores (parceiros externos)
- Propostas Concorrentes (benchmark de mercado)

**Operação**
- Operacional (agrupamento por serviço/cliente/data, checklist editável)
- Escalas (visualização semanal)
- Ocorrências (notificação multi-setor)
- Estoque (EPI, material, ferramentas)

**Pessoas**
- Funcionários (CLT + avulsos, 8 tipos de turno)
- Currículos (pipeline de seleção)

**Financeiro**
- Contas a pagar/receber + fluxo de caixa
- Despesas (reembolsáveis dos sócios)

**🔒 Sala dos Sócios** (restrita a Administradores)
- Calculadora do Gatilho Pró-Labore
- Cenários 40/60
- Projeção 12 meses
- Benchmark RJ (CCT + preços de mercado)
- Acerto entre sócios (rateio automático)
- Caixa consolidado ancorado ao sistema

## Modelo financeiro

Baseado na planilha `06_Modelo_Financeiro_Referencia.xlsx` da PS Facilities:

- **Reserva DAS:** 20% do caixa bruto
- **Reserva Operacional:** 10% do caixa bruto
- **Gatilho mínimo:** R$ 12.000 (caixa líquido)
- **Distribuição:** 40% retenção + 60% sócios (igualitário entre 4)
- **Metas:** M3: R$ 12k · M6: R$ 30k · M9: R$ 60k · M12: R$ 100k

## Persistência

- **Sessão de login:** `localStorage` (chave `psfm:auth:login`)
- **Dados do domínio:** em memória via Zustand (resetam no reload)
- Para produção, integrar com backend real (PostgreSQL + REST API)

## Sobre a PS Facilities

Empresa de facilities management sediada em Nova Friburgo/RJ.
Sócios: Jonathan da Silva · David Souza · Márcio Kerol · Junior Alamar.
