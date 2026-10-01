import { toISO } from '../../../core/format'
import { uid } from '../../../core/id'
import { EXERCISES, EXERCISE_BY_ID } from '../data/exercises'
import type {
  CardioBlock, CardioKind, CardioMachine, DayKind, Exercise, Goal, Level, Muscle, Pattern,
  Plan, PlanDay, PlanExercise, Profile,
} from '../types'

/* ── Τυχαιότητα με seed, ώστε το ίδιο προφίλ να βγάζει το ίδιο πρόγραμμα ── */

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 }

/* ── Διαθεσιμότητα ασκήσεων ──────────────────────────────────────────── */

export function hasEquipment(ex: Exercise, equipment: string[]): boolean {
  const have = new Set(equipment)
  return ex.eq.every((group) => group.split('|').some((id) => have.has(id)))
}

export function isAllowed(ex: Exercise, p: Pick<Profile, 'equipment' | 'level' | 'limitations'>): boolean {
  return (
    hasEquipment(ex, p.equipment) &&
    LEVEL_RANK[ex.level] <= LEVEL_RANK[p.level] &&
    !(ex.stress ?? []).some((j) => p.limitations.includes(j))
  )
}

/** Τι «τύπου» άσκηση είναι — οι αρχάριοι προτιμούν μηχανήματα, οι προχωρημένοι ελεύθερα βάρη. */
function style(ex: Exercise): 'machine' | 'cable' | 'dumbbell' | 'barbell' | 'bodyweight' {
  const all = ex.eq.join('|')
  if (!all) return 'bodyweight'
  if (/barbell|ez_bar/.test(all) && !/dumbbells/.test(all)) return 'barbell'
  if (/dumbbells|kettlebell/.test(all)) return 'dumbbell'
  if (/cable|band/.test(all)) return 'cable'
  return 'machine'
}

const STYLE_SCORE: Record<Level, Record<ReturnType<typeof style>, number>> = {
  beginner:     { machine: 3, cable: 2, dumbbell: 1.6, barbell: 0.4, bodyweight: 1 },
  intermediate: { machine: 1.4, cable: 1.4, dumbbell: 2.2, barbell: 2.4, bodyweight: 0.6 },
  advanced:     { machine: 1, cable: 1.3, dumbbell: 2, barbell: 3, bodyweight: 0.6 },
}

function rank(candidates: Exercise[], level: Level, rand: () => number): Exercise[] {
  return candidates
    .map((ex) => ({ ex, score: STYLE_SCORE[level][style(ex)] + (ex.compound ? 0.3 : 0) + rand() * 1.2 }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.ex)
}

/** Εναλλακτικές για μια άσκηση: πρώτα ίδιο πρότυπο κίνησης, μετά ίδιος κύριος μυς. */
export function alternatives(exerciseId: string, profile: Profile): Exercise[] {
  const cur = EXERCISE_BY_ID.get(exerciseId)
  if (!cur) return []
  const allowed = EXERCISES.filter((e) => e.id !== cur.id && isAllowed(e, profile))
  const same = allowed.filter((e) => e.pattern === cur.pattern)
  const muscle = allowed.filter((e) => e.pattern !== cur.pattern && e.primary === cur.primary)
  return [...same, ...muscle]
}

/* ── Σετ, επαναλήψεις, διάλειμμα ─────────────────────────────────────── */

const RPE: Record<Level, string> = {
  beginner: 'RPE 6–7',
  intermediate: 'RPE 7–8',
  advanced: 'RPE 8–9',
}

export function prescribe(ex: Exercise, goal: Goal, level: Level): PlanExercise {
  const base = { exerciseId: ex.id, rpe: RPE[level] }
  if (ex.timed) {
    const t = { beginner: '20–30″', intermediate: '30–45″', advanced: '45–60″' }[level]
    return { ...base, sets: 3, reps: ex.id === 'farmer' ? '30–40 μ.' : t, restSec: 45 }
  }
  if (ex.pattern === 'core' || ex.pattern === 'calves') {
    return { ...base, sets: level === 'beginner' ? 2 : 3, reps: '12–15', restSec: 45 }
  }
  const big = ex.compound
  const beg = level === 'beginner'
  switch (goal) {
    case 'strength':
      if (big) return beg ? { ...base, sets: 3, reps: '6–8', restSec: 150 } : { ...base, sets: level === 'advanced' ? 5 : 4, reps: '3–6', restSec: 180 }
      return { ...base, sets: 3, reps: '8–10', restSec: 90 }
    case 'muscle':
      if (big) return { ...base, sets: beg ? 3 : 4, reps: '6–10', restSec: 120 }
      return { ...base, sets: 3, reps: '10–15', restSec: 60 }
    case 'fatloss':
      if (big) return { ...base, sets: 3, reps: '10–12', restSec: 75 }
      return { ...base, sets: beg ? 2 : 3, reps: '12–15', restSec: 45 }
    case 'fitness':
      if (big) return { ...base, sets: 3, reps: '8–12', restSec: 90 }
      return { ...base, sets: beg ? 2 : 3, reps: '12–15', restSec: 60 }
  }
}

/** Εκτίμηση διάρκειας μιας άσκησης σε λεπτά (σετ + διαλείμματα + στήσιμο). */
export function exerciseMinutes(pe: PlanExercise): number {
  return pe.sets * (0.67 + pe.restSec / 60) + 0.5
}

/* ── Πρότυπα ημερών ──────────────────────────────────────────────────── */

interface DayTemplate {
  title: string
  kind: Extract<DayKind, 'workout' | 'cardio'>
  focus: Muscle[]
  /** Κάθε θέση: λίστα προτύπων κίνησης κατά σειρά προτίμησης. */
  slots: Pattern[][]
  mobility: string[]
  /** Αν το τελικό καρδιο ταιριάζει σε αυτή τη μέρα (μετά από πόδια λιγότερο). */
  lowerBody?: boolean
}

const MOB_LOWER = ['Κυκλικές κινήσεις ισχίων ×10', 'Βαθύ κάθισμα με παύση 30″', 'Γέφυρες γλουτών ×15', 'Αιωρήσεις ποδιών μπρος-πίσω ×10/πόδι']
const MOB_UPPER = ['Κύκλοι χεριών μπρος-πίσω ×10', 'Band pull-aparts ×15', 'Περιστροφές θωρακικής ×8/πλευρά', 'Κάμψεις στον τοίχο ×10']
const MOB_FULL = ['Κυκλικές κινήσεις ισχίων & ώμων ×10', 'Καθίσματα σώματος ×10', 'Band pull-aparts ×15', 'Inchworm ×5']

const T: Record<string, DayTemplate> = {
  full_a: {
    title: 'Ολόσωμη Α', kind: 'workout', focus: ['quads', 'chest', 'back', 'hamstrings'],
    slots: [['squat'], ['hpush'], ['vpull', 'hpull'], ['hinge'], ['delt_iso', 'vpush'], ['ham_iso'], ['triceps'], ['core']],
    mobility: MOB_FULL, lowerBody: true,
  },
  full_b: {
    title: 'Ολόσωμη Β', kind: 'workout', focus: ['glutes', 'shoulders', 'back', 'quads'],
    slots: [['hinge'], ['vpush', 'hpush'], ['hpull', 'vpull'], ['lunge', 'squat'], ['chest_iso'], ['biceps'], ['calves'], ['core']],
    mobility: MOB_FULL, lowerBody: true,
  },
  full_c: {
    title: 'Ολόσωμη Γ', kind: 'workout', focus: ['quads', 'chest', 'back', 'glutes'],
    slots: [['squat', 'lunge'], ['hpush'], ['hpull', 'vpull'], ['glute_iso', 'hinge'], ['reardelt'], ['quad_iso', 'ham_iso'], ['biceps', 'triceps'], ['core']],
    mobility: MOB_FULL, lowerBody: true,
  },
  upper_a: {
    title: 'Πάνω σώμα Α', kind: 'workout', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    slots: [['hpush'], ['hpull'], ['vpush'], ['vpull'], ['delt_iso'], ['biceps'], ['triceps'], ['core']],
    mobility: MOB_UPPER,
  },
  upper_b: {
    title: 'Πάνω σώμα Β', kind: 'workout', focus: ['back', 'chest', 'shoulders', 'biceps', 'triceps'],
    slots: [['vpull'], ['hpush'], ['hpull'], ['chest_iso', 'vpush'], ['reardelt'], ['triceps'], ['biceps'], ['delt_iso']],
    mobility: MOB_UPPER,
  },
  lower_a: {
    title: 'Κάτω σώμα Α', kind: 'workout', focus: ['quads', 'hamstrings', 'glutes', 'calves'],
    slots: [['squat'], ['hinge'], ['lunge'], ['ham_iso'], ['quad_iso'], ['calves'], ['core']],
    mobility: MOB_LOWER, lowerBody: true,
  },
  lower_b: {
    title: 'Κάτω σώμα Β', kind: 'workout', focus: ['glutes', 'hamstrings', 'quads', 'adductors'],
    slots: [['hinge'], ['squat', 'lunge'], ['glute_iso'], ['ham_iso'], ['adductor', 'quad_iso'], ['calves'], ['core']],
    mobility: MOB_LOWER, lowerBody: true,
  },
  push: {
    title: 'Ώθηση (στήθος, ώμοι, τρικέφαλοι)', kind: 'workout', focus: ['chest', 'shoulders', 'triceps'],
    slots: [['hpush'], ['vpush'], ['hpush'], ['chest_iso'], ['delt_iso'], ['triceps'], ['triceps']],
    mobility: MOB_UPPER,
  },
  pull: {
    title: 'Έλξη (πλάτη, δικέφαλοι)', kind: 'workout', focus: ['back', 'biceps', 'shoulders'],
    slots: [['vpull'], ['hpull'], ['hpull', 'vpull'], ['reardelt'], ['biceps'], ['biceps'], ['core']],
    mobility: MOB_UPPER,
  },
  legs: {
    title: 'Πόδια', kind: 'workout', focus: ['quads', 'hamstrings', 'glutes', 'calves'],
    slots: [['squat'], ['hinge'], ['lunge'], ['quad_iso'], ['ham_iso'], ['glute_iso', 'adductor'], ['calves']],
    mobility: MOB_LOWER, lowerBody: true,
  },
  cardio_core: {
    title: 'Καρδιο & κορμός', kind: 'cardio', focus: ['core'],
    slots: [['core'], ['core'], ['core'], ['glute_iso']],
    mobility: ['Κυκλικές κινήσεις αστραγάλων & ισχίων ×10', 'Αιωρήσεις ποδιών ×10/πόδι', 'Cat-cow ×8'],
  },
}

/** Η διάσπαση της εβδομάδας ανάλογα με το πλήθος ημερών, το επίπεδο και τον στόχο. */
export function splitFor(days: number, level: Level, goal: Goal): string[] {
  const beg = level === 'beginner'
  switch (days) {
    case 1: return ['full_a']
    case 2: return ['full_a', 'full_b']
    case 3: return ['full_a', 'full_b', 'full_c']
    case 4: return ['upper_a', 'lower_a', 'upper_b', 'lower_b']
    case 5:
      if (beg) return ['full_a', 'cardio_core', 'full_b', 'full_c', 'cardio_core']
      if (goal === 'fatloss' || goal === 'fitness') return ['upper_a', 'lower_a', 'cardio_core', 'upper_b', 'lower_b']
      return ['upper_a', 'lower_a', 'push', 'pull', 'legs']
    default:
      if (beg) return ['upper_a', 'lower_a', 'cardio_core', 'upper_b', 'lower_b', 'cardio_core']
      if (goal === 'fatloss' || goal === 'fitness') return ['upper_a', 'lower_a', 'cardio_core', 'upper_b', 'lower_b', 'cardio_core']
      return ['push', 'pull', 'legs', 'push', 'pull', 'legs']
  }
}

export const SPLIT_NAME = (days: number, level: Level, goal: Goal): string => {
  const s = splitFor(days, level, goal)
  if (s.every((x) => x.startsWith('full'))) return 'Ολόσωμο πρόγραμμα'
  if (s.includes('push') && s.includes('upper_a')) return 'Πάνω/Κάτω + Ώθηση/Έλξη/Πόδια'
  if (s.includes('push')) return 'Ώθηση / Έλξη / Πόδια ×2'
  if (s.includes('full_a')) return 'Ολόσωμο + ημέρες καρδιο'
  if (s.includes('cardio_core')) return 'Πάνω / Κάτω + ημέρες καρδιο'
  return 'Πάνω / Κάτω σώμα'
}

/** Προτεινόμενες μέρες για κάθε πλήθος, με τουλάχιστον μία ξεκούραση ανάμεσα όπου γίνεται. */
export const DEFAULT_DAYS: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
}

/* ── Καρδιο ──────────────────────────────────────────────────────────── */

function availableCardio(p: Profile): CardioMachine[] {
  const have = (['treadmill', 'bike', 'elliptical', 'rower', 'stairs'] as CardioMachine[]).filter((m) => p.equipment.includes(m))
  const pref = p.cardio.filter((m) => have.includes(m))
  return pref.length ? pref : have
}

function finisherMinutes(goal: Goal, level: Level): number {
  if (goal === 'fatloss') return level === 'beginner' ? 12 : 15
  if (goal === 'fitness') return 12
  if (goal === 'muscle') return 10
  return 0
}

/* ── Γεννήτρια ───────────────────────────────────────────────────────── */

export function mondayOf(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return toISO(x)
}

export function generatePlan(profile: Profile, seed = Math.floor(Math.random() * 1e9)): Plan {
  const rand = rng(seed)
  const days = [...profile.days].sort((a, b) => a - b)
  const split = splitFor(days.length, profile.level, profile.goal)
  const cardioMachines = availableCardio(profile)
  const warmMachine: CardioMachine | undefined =
    profile.equipment.includes('treadmill') ? 'treadmill' : cardioMachines[0]
  const used = new Set<string>()
  let cardioTurn = 0
  const nextMachine = () => cardioMachines[cardioTurn++ % Math.max(1, cardioMachines.length)]

  // Εναλλαγή είδους καρδιο στις μέρες με βάρη: οι αρχάριοι κάνουν κυρίως σταθερό.
  let hiitTurn = 0
  const finisherKind = (): CardioKind => {
    const n = hiitTurn++
    if (profile.goal === 'muscle') return 'liss'
    if (profile.goal === 'fitness') return (['hiit', 'liss', 'tempo'] as CardioKind[])[n % 3]
    if (profile.level === 'beginner') return n % 3 === 1 ? 'hiit' : 'liss'
    return n % 2 === 0 ? 'hiit' : 'liss'
  }

  const out: PlanDay[] = []
  for (let wd = 0; wd < 7; wd++) {
    const idx = days.indexOf(wd)
    if (idx === -1) {
      out.push(restDay(wd, profile, days, warmMachine))
      continue
    }
    const tpl = T[split[idx % split.length]]
    out.push(buildDay(wd, tpl, profile, used, rand, warmMachine, () => nextMachine(), finisherKind))
  }
  return {
    id: uid('gp'),
    createdAt: Date.now(),
    startDate: mondayOf(new Date()),
    seed,
    profile,
    days: out,
  }
}

function buildDay(
  weekday: number,
  tpl: DayTemplate,
  p: Profile,
  used: Set<string>,
  rand: () => number,
  warmMachine: CardioMachine | undefined,
  nextMachine: () => CardioMachine | undefined,
  finisherKind: () => CardioKind,
): PlanDay {
  const warmup: CardioBlock | undefined = warmMachine ? { machine: warmMachine, kind: 'warmup', minutes: 5 } : undefined
  const cardio: CardioBlock[] = []
  let budget = p.sessionMinutes - (warmup ? warmup.minutes : 0) - 3 /* κινητικότητα */ - 4 /* αποθεραπεία */

  if (tpl.kind === 'cardio') {
    const m1 = nextMachine()
    const main = Math.round(Math.min(40, Math.max(20, budget * 0.65)))
    if (m1) {
      if (p.goal === 'fatloss' && p.level !== 'beginner' && main >= 30) {
        cardio.push({ machine: m1, kind: 'hiit', minutes: 18 })
        cardio.push({ machine: nextMachine() ?? m1, kind: 'liss', minutes: main - 18 })
      } else {
        cardio.push({ machine: m1, kind: p.goal === 'fitness' ? 'tempo' : p.level === 'beginner' ? 'liss' : 'hiit', minutes: main })
      }
    }
    budget -= cardio.reduce((s, c) => s + c.minutes, 0)
  } else {
    let fin = finisherMinutes(p.goal, p.level)
    // Μετά από πόδια, το βαρύ καρδιο το κάνουμε σταθερό για να μη χαλάσει η αποκατάσταση.
    if (p.goal === 'muscle' && !tpl.lowerBody) fin = 0
    const m = fin > 0 ? nextMachine() : undefined
    if (m && fin > 0) {
      let kind = finisherKind()
      if (tpl.lowerBody && kind === 'hiit' && p.goal !== 'fatloss') kind = 'liss'
      cardio.push({ machine: m, kind, minutes: fin })
      budget -= fin
    }
  }

  const exercises: PlanExercise[] = []
  const dayUsed = new Set<string>()
  const minEx = tpl.kind === 'cardio' ? 2 : 3
  for (const slot of tpl.slots) {
    const pick = pickFor(slot, p, used, dayUsed, rand)
    if (!pick) continue
    const pe = prescribe(pick, p.goal, p.level)
    const need = exerciseMinutes(pe)
    if (exercises.length >= minEx && need > budget) break
    exercises.push(pe)
    dayUsed.add(pick.id)
    used.add(pick.id)
    budget -= need
  }
  // Αν οι απαραίτητες ασκήσεις δεν χωρούν στον χρόνο, αφαίρεσε σετ (ποτέ κάτω από 2) αντί να ξεπεράσεις τη διάρκεια.
  while (budget < -2) {
    const i = exercises.reduce((best, pe, j) => (pe.sets >= exercises[best].sets ? j : best), 0)
    if (exercises[i].sets <= 2) break
    const before = exerciseMinutes(exercises[i])
    exercises[i] = { ...exercises[i], sets: exercises[i].sets - 1 }
    budget += before - exerciseMinutes(exercises[i])
  }

  return {
    weekday,
    kind: tpl.kind,
    title: tpl.title,
    focus: tpl.focus,
    warmup,
    mobility: tpl.mobility,
    exercises,
    cardio,
    cooldown: cooldownFor(tpl),
  }
}

function pickFor(slot: Pattern[], p: Profile, used: Set<string>, dayUsed: Set<string>, rand: () => number): Exercise | null {
  for (const pattern of slot) {
    const pool = EXERCISES.filter((e) => e.pattern === pattern && isAllowed(e, p) && !dayUsed.has(e.id))
    if (pool.length === 0) continue
    const ranked = rank(pool, p.level, rand)
    // Προτίμησε ασκήσεις που δεν έχουν μπει ήδη στην εβδομάδα, για ποικιλία.
    return ranked.find((e) => !used.has(e.id)) ?? ranked[0]
  }
  return null
}

function cooldownFor(tpl: DayTemplate): string[] {
  const lower = ['Διάταση τετρακεφάλων 30″/πόδι', 'Διάταση οπίσθιων μηριαίων 30″/πόδι', 'Διάταση γλουτού (figure-4) 30″/πλευρά']
  const upper = ['Διάταση στήθους στην πόρτα 30″', 'Διάταση πλατύτατου 30″/πλευρά', 'Διάταση τρικεφάλων 20″/χέρι']
  const base = ['Ήπιο περπάτημα 3–5′ για να πέσουν οι σφυγμοί']
  if (tpl.lowerBody && tpl.focus.includes('chest')) return [...base, lower[0], lower[1], upper[0], 'Child’s pose 30″']
  if (tpl.lowerBody) return [...base, ...lower, 'Διάταση γάμπας 30″/πόδι']
  if (tpl.kind === 'cardio') return [...base, lower[1], 'Διάταση ισχιακών καμπτήρων 30″/πόδι', 'Child’s pose 30″']
  return [...base, ...upper, 'Child’s pose 30″']
}

function restDay(weekday: number, p: Profile, days: number[], machine?: CardioMachine): PlanDay {
  // Μία πλήρης ξεκούραση την εβδομάδα (η τελευταία ελεύθερη μέρα)· οι άλλες ενεργή ανάκαμψη.
  // Στη δύναμη η αποκατάσταση μετράει περισσότερο, οπότε οι μισές ελεύθερες μέρες είναι πλήρης ξεκούραση.
  const free = [0, 1, 2, 3, 4, 5, 6].filter((d) => !days.includes(d))
  const pos = free.indexOf(weekday)
  const fullRest = pos === free.length - 1 || (p.goal === 'strength' && pos % 2 === 1)
  if (fullRest || !machine) {
    return {
      weekday, kind: 'rest', title: 'Ξεκούραση', focus: [], mobility: [], exercises: [], cardio: [],
      cooldown: ['Ύπνος 7–9 ώρες', 'Νερό 30–35 ml ανά κιλό σωματικού βάρους', 'Προαιρετικά: 10′ ήπιες διατάσεις'],
    }
  }
  const minutes = { fatloss: 35, fitness: 30, muscle: 25, strength: 20 }[p.goal] - (p.level === 'beginner' ? 5 : 0)
  return {
    weekday, kind: 'active', title: 'Ενεργή ανάκαμψη', focus: [],
    mobility: ['Κυκλικές κινήσεις αρθρώσεων 3′'],
    exercises: [],
    cardio: [{ machine, kind: 'recovery', minutes }],
    cooldown: ['Foam roller σε πόδια και πλάτη 5′', 'Ήπιες διατάσεις 5′'],
  }
}

/* ── Χρόνος συνεδρίας ────────────────────────────────────────────────── */

export function dayMinutes(day: PlanDay): number {
  if (day.kind === 'rest') return 0
  const ex = day.exercises.reduce((s, pe) => s + exerciseMinutes(pe), 0)
  const cardio = day.cardio.reduce((s, c) => s + c.minutes, 0)
  const extra = (day.warmup ? day.warmup.minutes : 0) + (day.mobility.length ? 3 : 0) + 4
  return Math.round(ex + cardio + extra)
}
