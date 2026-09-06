import { useEffect, useState } from 'react'

/** Πολύ απλός hash router: `#/expenses`. Δεν χρειάζεται server config. */
export function currentRoute(): string {
  const raw = window.location.hash.replace(/^#\/?/, '').trim()
  return raw || 'dashboard'
}

export function navigate(id: string) {
  window.location.hash = `#/${id}`
}

export function useRoute(): string {
  const [route, setRoute] = useState(currentRoute)
  useEffect(() => {
    const onChange = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
