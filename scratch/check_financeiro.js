import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co'
const supabaseAnonKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, error } = await supabase.from('financeiro').select('*').eq('tipo', 'pagamento_colaborador')
  if (error) console.error('Erro:', error)
  else console.log('Pagamentos no Financeiro:', data)
}

check()
