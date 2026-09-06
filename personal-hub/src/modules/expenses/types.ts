/** «Επαγγελματικά» ή «Προσωπικά» — οι δύο βασικές κατηγορίες. */
export type Kind = 'business' | 'personal'

export type PaymentMethod = 'card' | 'cash' | 'bank' | 'other'

export type Frequency = 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'yearly'

export interface Category {
  id: string
  name: string
  /** Σε ποιον τύπο εξόδου εμφανίζεται. */
  scope: Kind | 'both'
  /** 0–7 — δείκτης στην κατηγορική παλέτα. */
  colorIndex: number
  icon: string
  /** Οι προεπιλεγμένες δεν διαγράφονται, μόνο μετονομάζονται/κρύβονται. */
  builtIn?: boolean
  hidden?: boolean
}

export interface Expense {
  id: string
  /** YYYY-MM-DD (τοπική ημερομηνία). */
  date: string
  /** Τελικό ποσό με ΦΠΑ, σε ευρώ. */
  amount: number
  kind: Kind
  categoryId: string
  merchant: string
  paymentMethod: PaymentMethod
  /** Ποσοστό ΦΠΑ (π.χ. 24) — για τα επαγγελματικά. */
  vatRate?: number
  /** Ποσό ΦΠΑ σε ευρώ. */
  vatAmount?: number
  /** ΑΦΜ προμηθευτή, όταν διαβάζεται από την απόδειξη. */
  taxId?: string
  /** Αριθμός παραστατικού. */
  docNumber?: string
  notes?: string
  /** Παραπομπή στο store `receipts` (φωτογραφία απόδειξης). */
  receiptId?: string
  /** Αν προέκυψε από πάγιο έξοδο. */
  recurringId?: string
  source: 'manual' | 'scan' | 'recurring' | 'import'
  createdAt: number
  updatedAt: number
}

/** Πάγιο / επαναλαμβανόμενο έξοδο (π.χ. ετήσια ασφάλεια, μηνιαία συνδρομή). */
export interface Recurring {
  id: string
  label: string
  amount: number
  kind: Kind
  categoryId: string
  merchant: string
  paymentMethod: PaymentMethod
  frequency: Frequency
  /** Ημερομηνία πρώτης χρέωσης (YYYY-MM-DD). */
  startDate: string
  /** Προαιρετική λήξη. */
  endDate?: string
  vatRate?: number
  notes?: string
  active: boolean
  /** Η τελευταία ημερομηνία για την οποία έχει δημιουργηθεί εγγραφή. */
  lastGenerated?: string
  createdAt: number
  updatedAt: number
}

export interface ReceiptRecord {
  id: string
  blob: Blob
  mime: string
  ocrText?: string
  createdAt: number
}

export interface ExpenseSettings {
  defaultKind: Kind
  defaultPaymentMethod: PaymentMethod
  defaultVatRate: number
  /** Αυτόματη δημιουργία εγγραφών από πάγια κατά την εκκίνηση. */
  autoGenerateRecurring: boolean
  /** Μηνιαίος προϋπολογισμός προσωπικών εξόδων (0 = ανενεργός). */
  monthlyBudget: number
}

export const DEFAULT_SETTINGS: ExpenseSettings = {
  defaultKind: 'personal',
  defaultPaymentMethod: 'card',
  defaultVatRate: 24,
  autoGenerateRecurring: true,
  monthlyBudget: 0,
}

export const KIND_LABEL: Record<Kind, string> = {
  business: 'Επαγγελματικά',
  personal: 'Προσωπικά',
}
export const KIND_COLOR: Record<Kind, string> = {
  business: 'var(--series-1)',
  personal: 'var(--series-2)',
}
export const KIND_ICON: Record<Kind, string> = {
  business: 'briefcase',
  personal: 'home',
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: 'Κάρτα',
  cash: 'Μετρητά',
  bank: 'Τραπεζικό έμβασμα',
  other: 'Άλλο',
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  monthly: 'Μηνιαίο',
  bimonthly: 'Ανά δίμηνο',
  quarterly: 'Ανά τρίμηνο',
  semiannual: 'Ανά εξάμηνο',
  yearly: 'Ετήσιο',
}

/** Πόσοι μήνες μεσολαβούν ανά συχνότητα. */
export const FREQUENCY_MONTHS: Record<Frequency, number> = {
  monthly: 1, bimonthly: 2, quarterly: 3, semiannual: 6, yearly: 12,
}

export const VAT_RATES = [0, 6, 13, 24]
