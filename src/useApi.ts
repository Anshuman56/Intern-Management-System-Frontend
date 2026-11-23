import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'

// Loads data from a GET route and exposes a reload() for after create/update/delete
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  // Only the latest request may update state, so a slow old response
  // (e.g. from an earlier search keystroke) can't overwrite newer results
  const latest = useRef(0)

  const reload = useCallback(async () => {
    const requestId = ++latest.current
    setLoading(true)
    setError('')
    try {
      const result = await api<T>(path)
      if (requestId === latest.current) setData(result)
    } catch (err) {
      if (requestId === latest.current) setError((err as Error).message)
    } finally {
      if (requestId === latest.current) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching on mount is the point of this hook
    reload()
  }, [reload])

  return { data, error, loading, reload }
}
