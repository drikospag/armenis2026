export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'fatloss' | 'muscle' | 'strength' | 'fitness'
export type Joint = 'knees' | 'lowerback' | 'shoulders' | 'wrists'

export type Muscle =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'adductors' | 'calves' | 'core'

/** Το κινητικό πρότυπο — με αυτό η γεννήτρια γεμίζει τις «θέσεις» κάθε ημέρας. */
export type Pattern =
  | 'squat' | 'hinge' | 'lunge' | 'quad_iso' | 'ham_iso' | 'glute_iso' | 'adductor' | 'calves'
  | 'hpush' | 'vpush' | 'chest_iso' | 'delt_iso' | 'reardelt'
  | 'hpull' | 'vpull' | 'biceps' | 'triceps' | 'core'

export type EquipmentCat = 'machine' | 'cable' | 'free' | 'cardio'
export type CardioMachine = 'treadmill' | 'bike' | 'elliptical' | 'rower' | 'stairs'

export interface Equipment {
  id: string
  name: string
  cat: EquipmentCat
  desc: string
}

export interface Exercise {
  id: string
  name: string
  /** Το όνομα που θα ακούσεις στο γυμναστήριο. */
  en: string
  /** Κάθε στοιχείο είναι μία απαίτηση· το `a|b` σημαίνει «ένα από τα δύο». Κενό = σωματικό βάρος. */
  eq: string[]
  pattern: Pattern
  primary: Muscle
  secondary?: Muscle[]
  level: Level
  compound: boolean
  /** Αρθρώσεις που φορτίζει — αποκλείεται αν ο χρήστης δήλωσε πρόβλημα εκεί. */
  stress?: Joint[]
  /** Μετριέται σε χρόνο (σανίδα κ.λπ.) αντί για επαναλήψεις. */
  timed?: boolean
  cues: string[]
}

export interface Profile {
  level: Level
  goal: Goal
  /** Ημέρες προπόνησης, 0 = Δευτέρα … 6 = Κυριακή. */
  days: number[]
  sessionMinutes: number
  equipment: string[]
  /** Αγαπημένα μηχανήματα καρδιο, με σειρά προτίμησης. */
  cardio: CardioMachine[]
  limitations: Joint[]
  age?: number
  weightKg?: number
}

export type CardioKind = 'warmup' | 'liss' | 'hiit' | 'tempo' | 'recovery'

export interface CardioBlock {
  machine: CardioMachine
  kind: CardioKind
  minutes: number
}

export interface PlanExercise {
  exerciseId: string
  sets: number
  reps: string
  restSec: number
  rpe: string
}

export type DayKind = 'workout' | 'cardio' | 'active' | 'rest'

export interface PlanDay {
  weekday: number
  kind: DayKind
  title: string
  focus: Muscle[]
  warmup?: CardioBlock
  mobility: string[]
  exercises: PlanExercise[]
  cardio: CardioBlock[]
  cooldown: string[]
}

export interface Plan {
  id: string
  createdAt: number
  /** Δευτέρα της πρώτης εβδομάδας (YYYY-MM-DD) — από εδώ μετράει ο κύκλος 4 εβδομάδων. */
  startDate: string
  seed: number
  profile: Profile
  days: PlanDay[]
}

export interface LoggedSet {
  kg: number | null
  reps: number | null
  done: boolean
}

export interface LogEntry {
  exerciseId: string
  target: string
  sets: LoggedSet[]
}

export interface CardioLog {
  machine: CardioMachine
  minutes: number
  km: number | null
}

export interface WorkoutLog {
  id: string
  date: string
  week: number
  weekday: number
  title: string
  entries: LogEntry[]
  cardio: CardioLog[]
  durationMin: number | null
  /** 1 (πολύ εύκολη) … 5 (εξαντλητική). */
  feel: number | null
  notes: string
  createdAt: number
}

/* ── Ετικέτες ─────────────────────────────────────────────────────────── */

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Αρχάριος',
  intermediate: 'Μέσος',
  advanced: 'Προχωρημένος',
}
export const LEVEL_HINT: Record<Level, string> = {
  beginner: 'Λιγότερο από 6 μήνες σταθερή προπόνηση. Έμφαση σε μηχανήματα και τεχνική.',
  intermediate: '6 μήνες έως 2 χρόνια. Ελεύθερα βάρη και μηχανήματα, μεγαλύτερη ένταση.',
  advanced: 'Πάνω από 2 χρόνια. Βασικές ασκήσεις με μπάρα, υψηλή ένταση και όγκος.',
}

export const GOAL_LABEL: Record<Goal, string> = {
  fatloss: 'Απώλεια λίπους',
  muscle: 'Μυϊκή μάζα',
  strength: 'Δύναμη',
  fitness: 'Φυσική κατάσταση',
}
export const GOAL_HINT: Record<Goal, string> = {
  fatloss: 'Βάρη για να κρατήσεις μυ + καρδιο σε κάθε προπόνηση και ενεργή ανάκαμψη.',
  muscle: 'Μέτριες επαναλήψεις, περισσότερος όγκος, λίγο καρδιο για την καρδιά.',
  strength: 'Λίγες, βαριές επαναλήψεις στις βασικές ασκήσεις, μεγάλα διαλείμματα.',
  fitness: 'Ισορροπία βαρών και αντοχής — διαλειμματικό και σταθερό καρδιο.',
}

export const JOINT_LABEL: Record<Joint, string> = {
  knees: 'Γόνατα',
  lowerback: 'Μέση',
  shoulders: 'Ώμοι',
  wrists: 'Καρποί',
}

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Στήθος',
  back: 'Πλάτη',
  shoulders: 'Ώμοι',
  biceps: 'Δικέφαλοι',
  triceps: 'Τρικέφαλοι',
  quads: 'Τετρακέφαλοι',
  hamstrings: 'Οπίσθιοι μηριαίοι',
  glutes: 'Γλουτοί',
  adductors: 'Προσαγωγοί',
  calves: 'Γάμπες',
  core: 'Κορμός',
}

export const CARDIO_LABEL: Record<CardioMachine, string> = {
  treadmill: 'Διάδρομος',
  bike: 'Ποδήλατο',
  elliptical: 'Ελλειπτικό',
  rower: 'Κωπηλατική',
  stairs: 'Σκάλα (Stair climber)',
}

export const WEEKDAYS = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή']
export const WEEKDAYS_SHORT = ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']

export const DAY_KIND_LABEL: Record<DayKind, string> = {
  workout: 'Προπόνηση',
  cardio: 'Καρδιο & κορμός',
  active: 'Ενεργή ανάκαμψη',
  rest: 'Ξεκούραση',
}
export const DAY_KIND_COLOR: Record<DayKind, string> = {
  workout: 'var(--series-1)',
  cardio: 'var(--series-2)',
  active: 'var(--series-3)',
  rest: 'var(--line-strong)',
}
