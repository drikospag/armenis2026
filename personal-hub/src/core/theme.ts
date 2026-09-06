import { useCallback, useEffect, useState } from 'react'
import type { ThemeChoice } from './types'

const KEY = 'ph.theme'

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark') return v
  } catch { /* private mode */ }
  return 'system'
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice
  try {
    if (choice === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, choice)
  } catch { /* private mode */ }
}

export function useTheme(): [ThemeChoice, (c: ThemeChoice) => void, () => void] {
  const [choice, setChoice] = useState<ThemeChoice>(read)

  useEffect(() => { apply(choice) }, [choice])

  const cycle = useCallback(() => {
    setChoice((c) => (c === 'system' ? 'light' : c === 'light' ? 'dark' : 'system'))
  }, [])

  return [choice, setChoice, cycle]
}
