import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co'
const supabaseAnonKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const heraId = '443b8001-409e-4c6a-9dfd-eebf9abae3b3'

const pagamentos = [
  { dia_trabalhado: '2026-04-20', colaborador: 'Alessandra Scheles Lima', valor: 120.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-21', colaborador: 'Alessandra Scheles Lima', valor: 170.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-22', colaborador: 'Alessandra Scheles Lima', valor: 120.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-23', colaborador: 'Alessandra Scheles Lima', valor: 90.00, quem_pagou: 'Jonathan', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-16', colaborador: 'Lucas Costa do Nascimento', valor: 100.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-20', colaborador: 'Lucas Costa do Nascimento', valor: 120.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-21', colaborador: 'Lucas Costa do Nascimento', valor: 170.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-22', colaborador: 'Lucas Costa do Nascimento', valor: 120.00, quem_pagou: 'Rateado 4 sócios', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-23', colaborador: 'Lucas Costa do Nascimento', valor: 90.00, quem_pagou: 'Jonathan', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-23', colaborador: 'Natasha Neto de Souza', valor: 90.00, quem_pagou: 'Jonathan', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
  { dia_trabalhado: '2026-04-23', colaborador: 'Gerson Neto de Souza', valor: 90.00, quem_pagou: 'Jonathan', status: 'pago', servico_avulso_id: heraId, descricao: 'Serviço Construtora Hera' },
]

async function seed() {
  console.log('Inserindo pagamentos vinculados à Hera...')
  const { data, error } = await supabase.from('pagamentos_avulsos').insert(pagamentos)
  if (error) console.error('Erro:', error)
  else console.log('Sucesso:', data)
}

seed()
