import type { CardioBlock, CardioKind, CardioMachine, Joint, Level } from '../types'
import { CARDIO_LABEL } from '../types'

/**
 * Μετατρέπει ένα μπλοκ καρδιο (μηχάνημα + είδος + λεπτά) σε συγκεκριμένο
 * πρωτόκολλο: τμήματα με διάρκεια, ταχύτητα/κλίση ή αντίσταση και στόχο έντασης.
 * Η εβδομάδα του κύκλου (1–4) αυξάνει σταδιακά τη δυσκολία· η 4η αποφορτίζει.
 */

export interface CardioSegment {
  label: string
  /** Διάρκεια ενός γύρου σε δευτερόλεπτα. */
  sec: number
  setting: string
  intensity: string
  /** Πλήθος επαναλήψεων όταν το τμήμα είναι ζεύγος διαλειμμάτων. */
  repeat?: number
  /** Δεύτερο σκέλος του διαλείμματος (π.χ. ανάκαμψη). */
  rest?: { sec: number; setting: string; intensity: string }
}

export interface CardioProtocol {
  title: string
  machine: CardioMachine
  kind: CardioKind
  minutes: number
  segments: CardioSegment[]
  note?: string
}

export interface CardioCtx {
  level: Level
  limitations: Joint[]
  age?: number
}

export const CARDIO_KIND_LABEL: Record<CardioKind, string> = {
  warmup: 'Ζέσταμα',
  liss: 'Σταθερό καρδιο (LISS)',
  hiit: 'Διαλειμματικό (HIIT)',
  tempo: 'Τέμπο',
  recovery: 'Ενεργή ανάκαμψη',
}

const kmh = (n: number) => `${n.toLocaleString('el-GR', { maximumFractionDigits: 1 })} km/h`
const incl = (n: number) => `κλίση ${n}%`

type Effort = 'easy' | 'steady' | 'tempo' | 'hard'

/** Ρυθμίσεις μηχανήματος για κάθε ένταση. */
function setting(machine: CardioMachine, effort: Effort, ctx: CardioCtx, week: number): string {
  const lv = ctx.level
  const noRun = ctx.limitations.includes('knees')
  const bump = week === 3 ? 1 : 0
  switch (machine) {
    case 'treadmill': {
      const walk = { beginner: 5, intermediate: 5.5, advanced: 6 }[lv]
      const hillIncline = { beginner: 5, intermediate: 8, advanced: 10 }[lv] + bump
      const jog = { beginner: 7, intermediate: 8.5, advanced: 10 }[lv] + bump * 0.5
      const run = { beginner: 8.5, intermediate: 11, advanced: 13.5 }[lv] + bump * 0.5
      if (effort === 'easy') return `${kmh(walk - 0.5)} · ${incl(1)}`
      if (effort === 'steady') return `${kmh(walk)} · ${incl(hillIncline)}`
      if (effort === 'tempo') return noRun ? `${kmh(walk + 0.3)} · ${incl(hillIncline + 2)}` : `${kmh(jog)} · ${incl(1)}`
      return noRun ? `${kmh(walk + 0.5)} · ${incl(Math.min(15, hillIncline + 4))}` : `${kmh(run)} · ${incl(1)}`
    }
    case 'bike':
      if (effort === 'easy') return 'Αντίσταση χαμηλή (3–5) · 75–85 rpm'
      if (effort === 'steady') return 'Αντίσταση μέτρια (6–8) · 80–90 rpm'
      if (effort === 'tempo') return 'Αντίσταση 9–11 · 85–95 rpm'
      return 'Αντίσταση υψηλή (12–16) · 100+ rpm'
    case 'elliptical':
      if (effort === 'easy') return 'Αντίσταση 3–5 · άνετος ρυθμός'
      if (effort === 'steady') return 'Αντίσταση 6–8 · 140–150 βήματα/λεπτό'
      if (effort === 'tempo') return 'Αντίσταση 9–10 · 150–160 βήματα/λεπτό'
      return 'Αντίσταση 11–14 · όσο πιο γρήγορα μπορείς'
    case 'rower':
      if (effort === 'easy') return '18–20 κωπηλασίες/λεπτό · χαλαρά'
      if (effort === 'steady') return '20–24 κωπηλασίες/λεπτό · σταθερά'
      if (effort === 'tempo') return '24–26 κωπηλασίες/λεπτό · δυνατά'
      return '28–32 κωπηλασίες/λεπτό · με όλη τη δύναμη'
    case 'stairs':
      if (effort === 'easy') return 'Επίπεδο 3–4'
      if (effort === 'steady') return 'Επίπεδο 5–7'
      if (effort === 'tempo') return 'Επίπεδο 8–9'
      return 'Επίπεδο 10–12'
  }
}

/** Στόχος έντασης: σφυγμοί αν ξέρουμε την ηλικία, αλλιώς «τεστ ομιλίας». */
function intensity(effort: Effort, ctx: CardioCtx): string {
  const range: Record<Effort, [number, number]> = {
    easy: [0.5, 0.6], steady: [0.6, 0.7], tempo: [0.75, 0.85], hard: [0.85, 0.92],
  }
  const talk: Record<Effort, string> = {
    easy: 'πολύ ελαφρύ — μιλάς άνετα',
    steady: 'μέτριο — μιλάς με προτάσεις',
    tempo: 'δύσκολο — λίγες λέξεις',
    hard: 'πολύ δύσκολο — δεν μιλάς',
  }
  if (ctx.age && ctx.age > 12 && ctx.age < 100) {
    const max = 208 - 0.7 * ctx.age
    const [a, b] = range[effort]
    return `${Math.round(max * a)}–${Math.round(max * b)} σφυγμοί · ${talk[effort]}`
  }
  return talk[effort]
}

export function cardioProtocol(block: CardioBlock, ctx: CardioCtx, week: number): CardioProtocol {
  const { machine } = block
  let kind = block.kind
  // Η εβδομάδα αποφόρτισης δεν έχει έντονα διαλείμματα.
  if (week === 4 && (kind === 'hiit' || kind === 'tempo')) kind = 'liss'

  const scale = week === 2 ? 1.1 : week === 3 ? 1.2 : week === 4 ? 0.7 : 1
  const minutes = kind === 'warmup' ? block.minutes : Math.max(5, Math.round(block.minutes * scale))
  const s = (e: Effort) => setting(machine, e, ctx, week)
  const i = (e: Effort) => intensity(e, ctx)
  const noRun = machine === 'treadmill' && ctx.limitations.includes('knees')

  const title = `${CARDIO_KIND_LABEL[kind]} · ${CARDIO_LABEL[machine]}`
  const segments: CardioSegment[] = []
  let note: string | undefined

  switch (kind) {
    case 'warmup': {
      segments.push({ label: 'Ήπιο ξεκίνημα', sec: 120, setting: s('easy'), intensity: i('easy') })
      segments.push({ label: 'Ανέβασμα ρυθμού', sec: Math.max(60, (minutes - 2) * 60), setting: s('steady'), intensity: i('steady') })
      note = 'Στόχος: να ζεσταθείς και να ιδρώσεις ελαφρά — όχι να κουραστείς.'
      break
    }
    case 'liss': {
      segments.push({ label: 'Ζέσταμα', sec: 180, setting: s('easy'), intensity: i('easy') })
      segments.push({ label: 'Σταθερός ρυθμός', sec: Math.max(5, minutes - 5) * 60, setting: s('steady'), intensity: i('steady') })
      segments.push({ label: 'Χαλάρωμα', sec: 120, setting: s('easy'), intensity: i('easy') })
      note = machine === 'treadmill'
        ? 'Περπάτημα σε ανηφόρα: μην κρατιέσαι από τις χειρολαβές — μειώνεις την κλίση αν χρειαστεί.'
        : 'Σταθερός ρυθμός «ζώνης 2» — χτίζει αντοχή και καίει λίπος χωρίς να σε εξαντλεί.'
      break
    }
    case 'hiit': {
      const [work, rest] = { beginner: [60, 120], intermediate: [60, 60], advanced: [30, 60] }[ctx.level]
      const extra = week === 2 ? 1 : week === 3 ? 2 : 0
      const rounds = Math.max(4, Math.floor(((block.minutes - 6) * 60) / (work + rest))) + extra
      segments.push({ label: 'Ζέσταμα', sec: 240, setting: s('steady'), intensity: i('steady') })
      segments.push({
        label: noRun ? 'Γρήγορο περπάτημα σε ανηφόρα' : 'Έντονο',
        sec: work, setting: s('hard'), intensity: i('hard'), repeat: rounds,
        rest: { sec: rest, setting: s('easy'), intensity: i('easy') },
      })
      segments.push({ label: 'Χαλάρωμα', sec: 120, setting: s('easy'), intensity: i('easy') })
      note = noRun
        ? 'Λόγω γονάτων: τα διαλείμματα γίνονται με κλίση αντί για τρέξιμο — ίδιο όφελος, χωρίς κρούση.'
        : machine === 'treadmill'
          ? 'Άλλαξε ταχύτητα με τα κουμπιά γρήγορης επιλογής. Αν δεν κρατάς τον ρυθμό, κατέβασε 0,5 km/h.'
          : 'Τα έντονα τμήματα πρέπει να είναι πραγματικά δύσκολα· τα ήπια σε ξεκουράζουν πλήρως.'
      break
    }
    case 'tempo': {
      segments.push({ label: 'Ζέσταμα', sec: 300, setting: s('steady'), intensity: i('steady') })
      segments.push({ label: noRun ? 'Τέμπο σε ανηφόρα' : 'Τέμπο', sec: Math.max(5, minutes - 8) * 60, setting: s('tempo'), intensity: i('tempo') })
      segments.push({ label: 'Χαλάρωμα', sec: 180, setting: s('easy'), intensity: i('easy') })
      note = '«Άνετα δύσκολο» — ρυθμός που θα κρατούσες για περίπου μία ώρα αγώνα.'
      break
    }
    case 'recovery': {
      segments.push({ label: 'Χαλαρό', sec: minutes * 60, setting: s('easy').replace(/κλίση 1%/, 'κλίση 2–4%'), intensity: i('easy') })
      note = 'Βοηθά την αποκατάσταση και ανεβάζει την καθημερινή κίνηση. Αν είσαι εκτός γυμναστηρίου, ένας γρήγορος περίπατος έξω κάνει το ίδιο.'
      break
    }
  }

  const total = Math.round(
    segments.reduce((acc, seg) => acc + (seg.sec + (seg.rest?.sec ?? 0)) * (seg.repeat ?? 1), 0) / 60,
  )
  return { title, machine, kind, minutes: total, segments, note }
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}″`
  const m = Math.floor(sec / 60)
  const r = sec % 60
  return r ? `${m}′ ${r}″` : `${m}′`
}
