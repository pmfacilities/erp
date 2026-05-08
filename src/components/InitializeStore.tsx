import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function InitializeStore() {
  const fetchData = useStore((s) => s.fetchData)
  const autenticado = useStore((s) => s.autenticado)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return null
}
