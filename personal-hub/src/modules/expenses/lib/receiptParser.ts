/**
 * Ανάγνωση ελληνικής απόδειξης / τιμολογίου από το ακατέργαστο κείμενο του OCR.
 *
 * Δεν στοχεύει στην τελειότητα: στόχος είναι να προσυμπληρώσει σωστά τα πεδία
 * στις περισσότερες αποδείξεις, με τον χρήστη να επιβεβαιώνει πριν την αποθήκευση.
 */
import { round2, toISO } from '../../../core/format'

export interface ParsedReceipt {
  total?: number
  date?: string
  merchant?: string
  taxId?: string
  vatRate?: number
  vatAmount?: number
  docNumber?: string
  /** Όλα τα ποσά που εντοπίστηκαν — για γρήγορη χειροκίνητη διόρθωση. */
  amounts: number[]
  /** Ποια πεδία βρέθηκαν με σιγουριά (keyword match) κι όχι με fallback. */
  confident: Record<'total' | 'date' | 'merchant' | 'taxId' | 'vat', boolean>
}

/** Κεφαλαία χωρίς τόνους — για σταθερό keyword matching. */
export function normalizeGreek(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

/** Διορθώνει τα συνηθισμένα λάθη OCR μέσα σε αριθμητικά συμφραζόμενα. */
function fixDigits(s: string): string {
  return s.replace(/[ΟO]/g, '0').replace(/[ΙIl|]/g, '1').replace(/[Ss]/g, '5').replace(/[Bβ]/g, '8')
}

const AMOUNT_RE = /(?<!\d)(\d{1,3}(?:[.\s]\d{3})*|\d+)[.,](\d{2})(?!\d)/g

/** Βρίσκει όλα τα ποσά μιας γραμμής (ελληνική ή αγγλική μορφή). */
export function amountsIn(line: string): number[] {
  const out: number[] = []
  const cleaned = line.replace(/[€]/g, ' ')
  for (const m of cleaned.matchAll(AMOUNT_RE)) {
    const whole = m[1].replace(/[.\s]/g, '')
    const v = Number(`${whole}.${m[2]}`)
    if (isFinite(v)) out.push(round2(v))
  }
  return out
}

const TOTAL_KEYWORDS: { re: RegExp; weight: number }[] = [
  { re: /ΓΕΝΙΚΟ\s*ΣΥΝΟΛΟ|ΤΕΛΙΚΟ\s*(ΣΥΝΟΛΟ|ΠΟΣΟ)|ΠΛΗΡΩΤΕΟ|ΣΥΝΟΛΟ\s*ΠΛΗΡΩΜΗΣ|ΠΟΣΟ\s*ΠΛΗΡΩΜΗΣ/, weight: 5 },
  { re: /(?<![\u0391-\u03A9])ΣΥΝΟΛΟ(?![\u0391-\u03A9])|\bTOTAL\b|ΣΥΝ\.?\s*ΑΞΙΑ|ΣΥΝΟΛΙΚΗ?\s*ΑΞΙΑ/, weight: 4 },
  { re: /(?<![\u0391-\u03A9])(ΑΞΙΑ|ΠΟΣΟ|ΧΡΕΩΣΗ)(?![\u0391-\u03A9])|\bAMOUNT\b/, weight: 2 },
]
/** Γραμμές που δεν πρέπει ποτέ να θεωρηθούν «σύνολο». */
const TOTAL_BLOCKERS = /ΡΕΣΤΑ|ΜΕΤΡΗΤΑ|ΚΑΡΤΑ|ΠΡΟΚΑΤΑΒΟΛΗ|ΥΠΟΛΟΙΠΟ|ΚΑΘΑΡΗ\s*ΑΞΙΑ|ΠΡΟ\s*ΦΠΑ|ΑΞΙΑ\s*ΧΩΡΙΣ/

const MERCHANT_NOISE = /ΑΦΜ|Α\.?Φ\.?Μ|ΔΟΥ|Δ\.?Ο\.?Υ|ΤΗΛ|ΦΑΞ|ΑΡ\.?\s*ΜΗΤΡΩΟΥ|ΟΔΟΣ|Τ\.?Κ|ΑΠΟΔΕΙΞΗ|ΤΙΜΟΛΟΓΙΟ|ΛΙΑΝΙΚ|ΠΑΡΟΧΗΣ|ΥΠΗΡΕΣΙΩΝ|WWW|HTTP|@|ΑΝΤΙΓΡΑΦΟ|ΝΟΜΙΜΗ|ΣΗΜΑΝΣΗ/

export function parseReceipt(rawText: string): ParsedReceipt {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const upper = lines.map(normalizeGreek)
  const allText = upper.join('\n')

  const result: ParsedReceipt = {
    amounts: [],
    confident: { total: false, date: false, merchant: false, taxId: false, vat: false },
  }

  /* ── Σύνολο ─────────────────────────────────────────────── */
  let best: { value: number; weight: number; index: number } | null = null
  for (let i = 0; i < upper.length; i++) {
    const line = upper[i]
    if (TOTAL_BLOCKERS.test(line)) continue
    const kw = TOTAL_KEYWORDS.find((k) => k.re.test(line))
    if (!kw) continue
    // Το ποσό μπορεί να είναι στην ίδια γραμμή ή στην αμέσως επόμενη.
    const vals = amountsIn(line).concat(amountsIn(upper[i + 1] ?? '').length && !amountsIn(line).length ? amountsIn(upper[i + 1]) : [])
    if (vals.length === 0) continue
    const value = Math.max(...vals)
    if (!best || kw.weight > best.weight || (kw.weight === best.weight && i > best.index)) {
      best = { value, weight: kw.weight, index: i }
    }
  }

  const everyAmount = upper.flatMap(amountsIn)
  result.amounts = [...new Set(everyAmount)].sort((a, b) => b - a).slice(0, 12)

  if (best) {
    result.total = best.value
    result.confident.total = best.weight >= 4
  } else if (everyAmount.length) {
    // Fallback: το μεγαλύτερο ποσό είναι σχεδόν πάντα το σύνολο.
    result.total = Math.max(...everyAmount)
  }

  /* ── ΦΠΑ ────────────────────────────────────────────────── */
  const rateMatch = allText.match(/ΦΠΑ[^\d%]{0,12}(\d{1,2})\s*%/) ?? allText.match(/(\d{1,2})\s*%\s*ΦΠΑ/)
  if (rateMatch) {
    const r = Number(rateMatch[1])
    if ([0, 3, 4, 6, 9, 13, 17, 24].includes(r)) {
      result.vatRate = r
      result.confident.vat = true
    }
  }
  const vatLine = upper.find((l) => /ΦΠΑ/.test(l) && amountsIn(l).length > 0 && !/ΑΦΜ/.test(l))
  if (vatLine) {
    const vals = amountsIn(vatLine)
    // Στη γραμμή ΦΠΑ το μικρότερο ποσό είναι συνήθως ο φόρος (το άλλο η αξία).
    const candidate = Math.min(...vals)
    if (!result.total || candidate < result.total) result.vatAmount = candidate
  }

  /* ── Ημερομηνία ─────────────────────────────────────────── */
  const dateRe = /(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/
  const isoRe = /(\d{4})-(\d{2})-(\d{2})/
  for (const line of lines) {
    const iso = line.match(isoRe)
    if (iso) {
      const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
      if (isSane(d)) { result.date = toISO(d); result.confident.date = true; break }
    }
    const m = line.match(dateRe) ?? fixDigits(line).match(dateRe)
    if (m) {
      let [, dd, mm, yy] = m
      let year = Number(yy)
      if (year < 100) year += 2000
      const d = new Date(year, Number(mm) - 1, Number(dd))
      if (isSane(d) && Number(mm) >= 1 && Number(mm) <= 12 && Number(dd) >= 1 && Number(dd) <= 31) {
        result.date = toISO(d)
        result.confident.date = true
        break
      }
    }
  }

  /* ── ΑΦΜ ────────────────────────────────────────────────── */
  const afm = allText.match(/Α\.?\s?Φ\.?\s?Μ\.?\s*[:\-]?\s*(\d{9})/) ?? allText.match(/\bVAT\b[^\d]{0,6}(?:EL)?\s*(\d{9})/)
  if (afm) {
    result.taxId = afm[1]
    result.confident.taxId = true
  }

  /* ── Αριθμός παραστατικού ───────────────────────────────── */
  const doc = allText.match(/(?:ΑΡ\.?\s*(?:ΑΠΟΔΕΙΞΗΣ|ΤΙΜΟΛΟΓΙΟΥ|ΠΑΡΑΣΤΑΤΙΚΟΥ)|Α\/Α|ΑΡΙΘΜΟΣ)\s*[:\-]?\s*([\u0391-\u03A9A-Z0-9\-\/]{1,20})/)
  if (doc) result.docNumber = doc[1]

  /* ── Επωνυμία ───────────────────────────────────────────── */
  for (let i = 0; i < Math.min(upper.length, 7); i++) {
    const line = lines[i]
    const u = upper[i]
    if (MERCHANT_NOISE.test(u)) continue
    const letters = (u.match(/[\u0391-\u03A9A-Z]/g) ?? []).length
    if (letters < 4) continue
    if (letters / u.length < 0.55) continue
    result.merchant = titleCase(line)
    result.confident.merchant = i <= 2
    break
  }

  return result
}

function isSane(d: Date): boolean {
  const y = d.getFullYear()
  return !isNaN(d.getTime()) && y >= 2000 && y <= new Date().getFullYear() + 1
}

function titleCase(s: string): string {
  return s
    .toLocaleLowerCase('el-GR')
    .split(/\s+/)
    .map((w, i) => {
      const original = s.split(/\s+/)[i] ?? ''
      // Συντομογραφίες (Α.Ε., Ο.Ε., ΙΚΕ) μένουν κεφαλαίες.
      if (/^[\u0391-\u03A9A-Z.&]+$/.test(original) && (/[.&]/.test(original) || original.length <= 3)) return original
      return w.length > 2 ? w[0].toLocaleUpperCase('el-GR') + w.slice(1) : w.toLocaleUpperCase('el-GR')
    })
    .join(' ')
    .slice(0, 60)
}

/* ── Πρόταση κατηγορίας από την επωνυμία / το κείμενο ─────── */

const CATEGORY_HINTS: { re: RegExp; business: string; personal: string }[] = [
  { re: /ΒΕΝΖΙΝ|ΠΡΑΤΗΡΙ|ΚΑΥΣΙΜ|SHELL|\bBP\b|\bEKO\b|ΕΚΟ|AVIN|CORAL|ΕΛΙΝ|ΔΙΟΔ|PARKING|ΤΑΞΙ|TAXI|ΟΑΣΑ|ΚΤΕΛ|AEGEAN|ΟΣΕ/, business: 'b-travel', personal: 'p-transport' },
  { re: /ΞΕΝΟΔΟΧ|HOTEL|ROOMS|BOOKING|AIRBNB/, business: 'b-hotel', personal: 'p-travel' },
  { re: /ΕΣΤΙΑΤΟΡ|ΤΑΒΕΡΝ|CAFE|ΚΑΦΕ|COFFEE|ΨΗΤΟΠΩΛ|ΟΥΖΕΡΙ|PIZZA|BAR\b|ΖΑΧΑΡΟΠΛΑΣΤ|ΑΡΤΟΠΟΙ|ΦΟΥΡΝΟΣ/, business: 'b-meals', personal: 'p-eatout' },
  { re: /SUPER\s?MARKET|ΣΟΥΠΕΡ|ΜΑΡΚΕΤ|ΣΚΛΑΒΕΝΙΤ|ΑΒ ΒΑΣΙΛΟΠΟΥΛ|ΜΑΣΟΥΤΗ|ΛΙΝΤΛ|LIDL|ΓΑΛΑΞΙΑΣ|ΜΑΡΙΝΟΠΟΥΛ|ΚΡΕΟΠΩΛ|ΜΑΝΑΒ/, business: 'b-other', personal: 'p-market' },
  { re: /ΦΑΡΜΑΚΕΙ|PHARMAC|ΙΑΤΡ|ΔΙΑΓΝΩΣΤΙΚ|ΟΔΟΝΤ|ΝΟΣΟΚΟΜ|ΚΛΙΝΙΚ/, business: 'b-other', personal: 'p-health' },
  { re: /ΔΕΗ|ΕΥΔΑΠ|ΕΥΑΘ|ΦΥΣΙΚΟ ΑΕΡΙΟ|ΗΡΩΝ|ΠΡΩΤΕΥΣ|ΕΛΠΕΔΙΣΟΝ|ΝΕΡΟ|ΡΕΥΜΑ/, business: 'b-other', personal: 'p-bills' },
  { re: /COSMOTE|VODAFONE|NOVA|WIND|ΤΗΛΕΠΙΚΟΙΝ|INTERNET/, business: 'b-telecom', personal: 'p-bills' },
  { re: /PUBLIC|ΠΛΑΙΣΙΟ|KOTSOVOLOS|ΚΩΤΣΟΒΟΛΟΣ|MEDIA\s?MARKT|GERMANOS|ΓΕΡΜΑΝΟΣ|ΗΛΕΚΤΡΟΝΙΚ|COMPUTER/, business: 'b-equipment', personal: 'p-other' },
  { re: /MICROSOFT|GOOGLE|ADOBE|APPLE|NETFLIX|SPOTIFY|OPENAI|ANTHROPIC|GITHUB|SUBSCRIPTION|ΣΥΝΔΡΟΜ/, business: 'b-software', personal: 'p-subs' },
  { re: /ΛΟΓΙΣΤ|ΔΙΚΗΓΟΡ|ΣΥΜΒΟΥΛ|ΝΟΤΑΡ|ΣΥΜΒΟΛΑΙΟΓΡΑΦ/, business: 'b-services', personal: 'p-other' },
  { re: /ΑΣΦΑΛ|ΕΦΚΑ|ΤΕΒΕ|INSURANCE/, business: 'b-insurance', personal: 'p-other' },
  { re: /ΒΙΒΛΙΟΠΩΛ|ΧΑΡΤΙΚ|ΓΡΑΦΙΚΗ ΥΛΗ|ΤΥΠΟΓΡΑΦ/, business: 'b-office', personal: 'p-other' },
  { re: /ΣΕΜΙΝΑΡ|ΕΚΠΑΙΔΕΥ|ΦΡΟΝΤΙΣΤΗΡ|ΣΧΟΛ/, business: 'b-training', personal: 'p-kids' },
  { re: /ZARA|H&M|ΥΠΟΔΗΜΑΤ|ΕΝΔΥΜΑΤ|FASHION|SPORT/, business: 'b-other', personal: 'p-clothes' },
  { re: /ΚΙΝΗΜΑΤΟΓΡΑΦ|ΘΕΑΤΡ|CINEMA|ΓΥΜΝΑΣΤΗΡ|GYM/, business: 'b-other', personal: 'p-fun' },
]

/**
 * Προτείνει κατηγορία. Η επωνυμία ελέγχεται πρώτη — οι γραμμές των ειδών
 * (π.χ. «ΚΑΦΕΣ ΦΙΛΤΡΟΥ» σε απόδειξη σούπερ μάρκετ) δεν πρέπει να την παρασύρουν.
 */
export function guessCategory(merchant: string, fullText: string, kind: 'business' | 'personal'): string | undefined {
  const header = normalizeGreek([merchant, ...fullText.split(/\r?\n/).slice(0, 4)].join(' '))
  const all = normalizeGreek(fullText)
  for (const source of [header, all]) {
    for (const hint of CATEGORY_HINTS) {
      if (hint.re.test(source)) return kind === 'business' ? hint.business : hint.personal
    }
  }
  return undefined
}
