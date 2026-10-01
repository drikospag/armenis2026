import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { dbClear, dbDelete, dbGetAll, dbPut, metaGet, metaSet } from '../../core/db'
import { uid } from '../../core/id'
import { EXERCISE_BY_ID } from './data/exercises'
import { dayFromRoutine, generatePlan, mondayOf, prescribe } from './lib/generator'
import { shrinkImage } from './lib/photos'
import type { Plan, PlanDay, PlanExercise, Profile, Routine, WorkoutLog } from './types'

interface GymStore {
  ready: boolean
  plan: Plan | null
  logs: WorkoutLog[]

  createPlan: (profile: Profile, seed?: number) => Promise<Plan>
  /** Ξαναφτιάχνει το πρόγραμμα με το ίδιο προφίλ αλλά άλλες ασκήσεις. */
  reshuffle: () => Promise<void>
  updateDay: (weekday: number, fn: (d: PlanDay) => PlanDay) => Promise<void>
  swapExercise: (weekday: number, index: number, exerciseId: string) => Promise<void>
  removeExercise: (weekday: number, index: number) => Promise<void>
  addExercise: (weekday: number, exerciseId: string) => Promise<void>
  moveExercise: (weekday: number, index: number, dir: -1 | 1) => Promise<void>
  /** Αλλάζει σετ, επαναλήψεις, διάλειμμα ή κιλά μιας άσκησης της ημέρας. */
  updateExercise: (weekday: number, index: number, patch: Partial<PlanExercise>) => Promise<void>
  /** Βάζει ένα δικό σου πρόγραμμα σε μια μέρα της εβδομάδας. */
  assignRoutine: (routineId: string, weekday: number) => Promise<void>
  restartCycle: () => Promise<void>
  deletePlan: () => Promise<void>

  saveLog: (log: Omit<WorkoutLog, 'id' | 'createdAt'> & { id?: string }) => Promise<WorkoutLog>
  deleteLog: (id: string) => Promise<void>
  wipeLogs: () => Promise<void>

  routines: Routine[]
  saveRoutine: (r: Routine) => Promise<void>
  deleteRoutine: (id: string) => Promise<void>

  /** Φωτογραφίες που ανέβασε ο χρήστης, ανά id μηχανήματος (object URLs). */
  photos: Record<string, string>
  setPhoto: (equipmentId: string, file: File) => Promise<void>
  removePhoto: (equipmentId: string) => Promise<void>
}

interface PhotoRecord { id: string; blob: Blob }

const Ctx = createContext<GymStore | null>(null)
const PLAN_KEY = 'gym.plan'
const ROUTINES_KEY = 'gym.routines'

export function GymProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const urls = useRef<Record<string, string>>({})

  const load = useCallback(async () => {
    const [p, l, r, ph] = await Promise.all([
      metaGet<Plan | null>(PLAN_KEY, null),
      dbGetAll<WorkoutLog>('gym_logs'),
      metaGet<Routine[]>(ROUTINES_KEY, []),
      dbGetAll<PhotoRecord>('gym_photos').catch(() => [] as PhotoRecord[]),
    ])
    setPlan(p)
    setLogs(l.sort(byDateDesc))
    setRoutines(r)
    const map: Record<string, string> = {}
    for (const rec of ph) map[rec.id] = URL.createObjectURL(rec.blob)
    urls.current = map
    setPhotos(map)
    setReady(true)
  }, [])

  // Απελευθέρωση των object URLs όταν κλείνει η σελίδα του module.
  useEffect(() => () => { Object.values(urls.current).forEach((u) => URL.revokeObjectURL(u)) }, [])

  useEffect(() => {
    load().catch((err) => {
      console.error(err)
      setReady(true)
    })
  }, [load])

  const api = useMemo<GymStore>(() => {
    async function savePlan(next: Plan | null) {
      await metaSet(PLAN_KEY, next)
      setPlan(next)
    }
    async function editDay(weekday: number, fn: (d: PlanDay) => PlanDay) {
      if (!plan) return
      await savePlan({ ...plan, days: plan.days.map((d) => (d.weekday === weekday ? fn(d) : d)) })
    }
    return {
      ready, plan, logs,

      async createPlan(profile, seed) {
        const p = generatePlan(profile, seed)
        await savePlan(p)
        return p
      },
      async reshuffle() {
        if (!plan) return
        const fresh = generatePlan(plan.profile)
        await savePlan({ ...fresh, startDate: plan.startDate })
      },
      updateDay: editDay,
      swapExercise: (weekday, index, exerciseId) =>
        editDay(weekday, (d) => {
          const ex = EXERCISE_BY_ID.get(exerciseId)
          if (!ex || !plan) return d
          const old = d.exercises[index]
          const fresh = prescribe(ex, plan.profile.goal, plan.profile.level)
          // Κράτα σετ/διάλειμμα αν ο χρήστης τα είχε αλλάξει και η νέα άσκηση είναι του ίδιου τύπου.
          const keep = old && EXERCISE_BY_ID.get(old.exerciseId)?.compound === ex.compound && !ex.timed
          const next = keep ? { ...old, exerciseId } : fresh
          return { ...d, exercises: d.exercises.map((pe, i) => (i === index ? next : pe)) }
        }),
      removeExercise: (weekday, index) =>
        editDay(weekday, (d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== index) })),
      addExercise: (weekday, exerciseId) =>
        editDay(weekday, (d) => {
          const ex = EXERCISE_BY_ID.get(exerciseId)
          if (!ex || !plan) return d
          const kind = d.kind === 'rest' || d.kind === 'active' ? 'workout' : d.kind
          const title = d.kind === 'rest' || d.kind === 'active' ? 'Επιπλέον προπόνηση' : d.title
          return { ...d, kind, title, exercises: [...d.exercises, prescribe(ex, plan.profile.goal, plan.profile.level)] }
        }),
      moveExercise: (weekday, index, dir) =>
        editDay(weekday, (d) => {
          const j = index + dir
          if (j < 0 || j >= d.exercises.length) return d
          const list = [...d.exercises]
          ;[list[index], list[j]] = [list[j], list[index]]
          return { ...d, exercises: list }
        }),
      updateExercise: (weekday, index, patch) =>
        editDay(weekday, (d) => ({ ...d, exercises: d.exercises.map((pe, i) => (i === index ? { ...pe, ...patch } : pe)) })),
      async assignRoutine(routineId, weekday) {
        const r = routines.find((x) => x.id === routineId)
        if (!r || !plan) return
        await editDay(weekday, (d) => dayFromRoutine(d, r, plan.profile))
      },
      async restartCycle() {
        if (!plan) return
        await savePlan({ ...plan, startDate: mondayOf(new Date()) })
      },
      deletePlan: () => savePlan(null),

      async saveLog(input) {
        const row: WorkoutLog = { ...input, id: input.id ?? uid('w'), createdAt: Date.now() }
        await dbPut('gym_logs', row)
        setLogs((cur) => [row, ...cur.filter((l) => l.id !== row.id)].sort(byDateDesc))
        return row
      },
      async deleteLog(id) {
        await dbDelete('gym_logs', id)
        setLogs((cur) => cur.filter((l) => l.id !== id))
      },
      async wipeLogs() {
        await dbClear('gym_logs')
        setLogs([])
      },

      routines,
      async saveRoutine(r) {
        const next = routines.some((x) => x.id === r.id)
          ? routines.map((x) => (x.id === r.id ? { ...r, updatedAt: Date.now() } : x))
          : [...routines, r]
        await metaSet(ROUTINES_KEY, next)
        setRoutines(next)
      },
      async deleteRoutine(id) {
        const next = routines.filter((x) => x.id !== id)
        await metaSet(ROUTINES_KEY, next)
        setRoutines(next)
      },

      photos,
      async setPhoto(equipmentId, file) {
        const blob = await shrinkImage(file)
        await dbPut<PhotoRecord>('gym_photos', { id: equipmentId, blob })
        const url = URL.createObjectURL(blob)
        if (urls.current[equipmentId]) URL.revokeObjectURL(urls.current[equipmentId])
        urls.current = { ...urls.current, [equipmentId]: url }
        setPhotos(urls.current)
      },
      async removePhoto(equipmentId) {
        await dbDelete('gym_photos', equipmentId)
        if (urls.current[equipmentId]) URL.revokeObjectURL(urls.current[equipmentId])
        const { [equipmentId]: _gone, ...rest } = urls.current
        void _gone
        urls.current = rest
        setPhotos(rest)
      },
    }
  }, [ready, plan, logs, routines, photos])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useGym(): GymStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGym χρειάζεται <GymProvider>')
  return ctx
}

function byDateDesc(a: WorkoutLog, b: WorkoutLog) {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt
}
