import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glkaisuepnuoatiudzqv.supabase.co'
const supabaseAnonKey = 'sb_publishable_X_4N5vLe-Iq01NSkHQ70hA_2x3Y_F-v'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findHera() {
  const { data, error } = await supabase.from('servicos_avulsos').select('id, cliente').ilike('cliente', '%HERA%').limit(1)
  if (error) console.error('Erro:', error)
  else console.log('Hera ID:', data[0]?.id)
}

findHera()
