import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// Loads data from a GET route and exposes a reload() for after create/update/delete
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api<T>(path))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching on mount is the point of this hook
    reload()
  }, [reload])

  return { data, error, loading, reload }
}
