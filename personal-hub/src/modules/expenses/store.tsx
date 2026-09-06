import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { dbClear, dbDelete, dbGet, dbGetAll, dbPut, dbPutMany, metaGet, metaSet } from '../../core/db'
import { uid } from '../../core/id'
import { DEFAULT_CATEGORIES } from './defaults'
import { demoExpenses, demoRecurring, isDemo } from './demo'
import { generateDue } from './lib/recurring'
import type { Category, Expense, ExpenseSettings, Recurring, ReceiptRecord } from './types'
import { DEFAULT_SETTINGS } from './types'

interface ExpenseStore {
  ready: boolean
  expenses: Expense[]
  categories: Category[]
  recurring: Recurring[]
  settings: ExpenseSettings
  categoryById: Map<string, Category>

  addExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  addManyExpenses: (rows: Expense[]) => Promise<void>

  saveReceipt: (blob: Blob, ocrText?: string) => Promise<string>
  getReceipt: (id: string) => Promise<ReceiptRecord | undefined>
  deleteReceipt: (id: string) => Promise<void>

  saveCategory: (c: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  saveRecurring: (r: Recurring) => Promise<void>
  deleteRecurring: (id: string) => Promise<void>
  /** Δημιουργεί τις εγγραφές που έχουν «ωριμάσει» μέχρι σήμερα. Επιστρέφει πλήθος. */
  runRecurring: () => Promise<number>

  saveSettings: (patch: Partial<ExpenseSettings>) => Promise<void>
  wipeAll: () => Promise<void>
  reload: () => Promise<void>
}

const Ctx = createContext<ExpenseStore | null>(null)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [settings, setSettings] = useState<ExpenseSettings>(DEFAULT_SETTINGS)

  const load = useCallback(async () => {
    let cats = await dbGetAll<Category>('categories')
    if (cats.length === 0) {
      await dbPutMany('categories', DEFAULT_CATEGORIES)
      cats = DEFAULT_CATEGORIES
    }
    let [exp, rec, st] = await Promise.all([
      dbGetAll<Expense>('expenses'),
      dbGetAll<Recurring>('recurring'),
      metaGet<ExpenseSettings>('expenses.settings', DEFAULT_SETTINGS),
    ])

    // Η έκδοση επίδειξης ανοίγει με δείγμα, ώστε να φαίνεται τι κάνει η εφαρμογή.
    if (isDemo() && exp.length === 0 && rec.length === 0) {
      exp = demoExpenses()
      rec = demoRecurring()
      await dbPutMany('expenses', exp)
      await dbPutMany('recurring', rec)
    }
    setCategories(cats)
    setExpenses(exp.sort(byDateDesc))
    setRecurring(rec)
    setSettings({ ...DEFAULT_SETTINGS, ...st })
    setReady(true)
  }, [])

  useEffect(() => {
    load().catch((err) => {
      console.error(err)
      setReady(true)
    })
  }, [load])

  // Αυτόματη δημιουργία των πάγιων εξόδων που έχουν λήξει, μία φορά ανά φόρτωση.
  const [autoRan, setAutoRan] = useState(false)
  useEffect(() => {
    if (!ready || autoRan || !settings.autoGenerateRecurring) return
    setAutoRan(true)
    void runRecurringInternal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoRan, settings.autoGenerateRecurring])

  async function runRecurringInternal(): Promise<number> {
    const rows = await dbGetAll<Recurring>('recurring')
    const existing = await dbGetAll<Expense>('expenses')
    const { created, updatedRecurring } = generateDue(rows, existing)
    if (created.length === 0) return 0
    await dbPutMany('expenses', created)
    await dbPutMany('recurring', updatedRecurring)
    setExpenses((cur) => [...created, ...cur].sort(byDateDesc))
    setRecurring(updatedRecurring.length ? mergeById(rows, updatedRecurring) : rows)
    return created.length
  }

  const api = useMemo<ExpenseStore>(() => {
    const categoryById = new Map(categories.map((c) => [c.id, c]))
    return {
      ready, expenses, categories, recurring, settings, categoryById,

      async addExpense(input) {
        const now = Date.now()
        const row: Expense = { ...input, id: uid('e'), createdAt: now, updatedAt: now }
        await dbPut('expenses', row)
        setExpenses((cur) => [row, ...cur].sort(byDateDesc))
        return row
      },

      async updateExpense(id, patch) {
        const cur = await dbGet<Expense>('expenses', id)
        if (!cur) return
        const row: Expense = { ...cur, ...patch, id, updatedAt: Date.now() }
        await dbPut('expenses', row)
        setExpenses((list) => list.map((e) => (e.id === id ? row : e)).sort(byDateDesc))
      },

      async deleteExpense(id) {
        const cur = await dbGet<Expense>('expenses', id)
        await dbDelete('expenses', id)
        if (cur?.receiptId) await dbDelete('receipts', cur.receiptId)
        setExpenses((list) => list.filter((e) => e.id !== id))
      },

      async addManyExpenses(rows) {
        await dbPutMany('expenses', rows)
        setExpenses((cur) => [...rows, ...cur].sort(byDateDesc))
      },

      async saveReceipt(blob, ocrText) {
        const rec: ReceiptRecord = { id: uid('r'), blob, mime: blob.type || 'image/jpeg', ocrText, createdAt: Date.now() }
        await dbPut('receipts', rec)
        return rec.id
      },
      getReceipt: (id) => dbGet<ReceiptRecord>('receipts', id),
      deleteReceipt: (id) => dbDelete('receipts', id).then(() => undefined),

      async saveCategory(c) {
        await dbPut('categories', c)
        setCategories((cur) => (cur.some((x) => x.id === c.id) ? cur.map((x) => (x.id === c.id ? c : x)) : [...cur, c]))
      },

      async deleteCategory(id) {
        await dbDelete('categories', id)
        setCategories((cur) => cur.filter((c) => c.id !== id))
      },

      async saveRecurring(r) {
        await dbPut('recurring', r)
        setRecurring((cur) => (cur.some((x) => x.id === r.id) ? cur.map((x) => (x.id === r.id ? r : x)) : [...cur, r]))
      },

      async deleteRecurring(id) {
        await dbDelete('recurring', id)
        setRecurring((cur) => cur.filter((r) => r.id !== id))
      },

      runRecurring: runRecurringInternal,

      async saveSettings(patch) {
        const next = { ...settings, ...patch }
        await metaSet('expenses.settings', next)
        setSettings(next)
      },

      async wipeAll() {
        await Promise.all([dbClear('expenses'), dbClear('recurring'), dbClear('receipts'), dbClear('categories')])
        await dbPutMany('categories', DEFAULT_CATEGORIES)
        setExpenses([])
        setRecurring([])
        setCategories(DEFAULT_CATEGORIES)
      },

      reload: load,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, expenses, categories, recurring, settings, load])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useExpenses(): ExpenseStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useExpenses χρειάζεται <ExpenseProvider>')
  return ctx
}

const byDateDesc = (a: Expense, b: Expense) =>
  a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1

function mergeById(base: Recurring[], updates: Recurring[]): Recurring[] {
  const map = new Map(base.map((r) => [r.id, r]))
  for (const u of updates) map.set(u.id, u)
  return [...map.values()]
}
