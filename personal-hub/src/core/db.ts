/**
 * Λεπτό wrapper πάνω από IndexedDB. Όλα τα δεδομένα μένουν στον browser σου —
 * τίποτα δεν φεύγει από τον υπολογιστή.
 *
 * Για να προσθέσεις store νέου module: βάλε το στο SCHEMA και ανέβασε το DB_VERSION.
 */

const DB_NAME = 'personal-hub'
const DB_VERSION = 1

interface StoreDef {
  name: string
  keyPath: string
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[]
}

const SCHEMA: StoreDef[] = [
  {
    name: 'expenses',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' },
      { name: 'kind', keyPath: 'kind' },
      { name: 'categoryId', keyPath: 'categoryId' },
      { name: 'recurringId', keyPath: 'recurringId' },
    ],
  },
  { name: 'categories', keyPath: 'id' },
  { name: 'recurring', keyPath: 'id' },
  { name: 'receipts', keyPath: 'id' },
  { name: 'meta', keyPath: 'key' },
]

let dbPromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const def of SCHEMA) {
        const store = db.objectStoreNames.contains(def.name)
          ? req.transaction!.objectStore(def.name)
          : db.createObjectStore(def.name, { keyPath: def.keyPath })
        for (const idx of def.indexes ?? []) {
          if (!store.indexNames.contains(idx.name)) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false })
          }
        }
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('Η βάση είναι κλειδωμένη από άλλη ανοιχτή καρτέλα.'))
  })
  return dbPromise
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode)
        const req = fn(tx.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

export const dbGetAll = <T>(store: string): Promise<T[]> => run<T[]>(store, 'readonly', (s) => s.getAll())
export const dbGet = <T>(store: string, key: IDBValidKey): Promise<T | undefined> =>
  run<T | undefined>(store, 'readonly', (s) => s.get(key))
export const dbPut = <T>(store: string, value: T): Promise<IDBValidKey> =>
  run<IDBValidKey>(store, 'readwrite', (s) => s.put(value as unknown as object) as IDBRequest<IDBValidKey>)
export const dbDelete = (store: string, key: IDBValidKey): Promise<undefined> =>
  run<undefined>(store, 'readwrite', (s) => s.delete(key) as unknown as IDBRequest<undefined>)
export const dbClear = (store: string): Promise<undefined> =>
  run<undefined>(store, 'readwrite', (s) => s.clear() as unknown as IDBRequest<undefined>)

/** Γράφει πολλές εγγραφές σε ένα transaction. */
export function dbPutMany<T>(store: string, values: T[]): Promise<void> {
  if (values.length === 0) return Promise.resolve()
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite')
        const s = tx.objectStore(store)
        for (const v of values) s.put(v as unknown as object)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

/** Απλό key/value για ρυθμίσεις. */
export async function metaGet<T>(key: string, fallback: T): Promise<T> {
  const row = await dbGet<{ key: string; value: T }>('meta', key)
  return row ? row.value : fallback
}
export function metaSet<T>(key: string, value: T): Promise<IDBValidKey> {
  return dbPut('meta', { key, value })
}
