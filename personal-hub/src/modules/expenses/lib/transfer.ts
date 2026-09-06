/** Εξαγωγή / εισαγωγή δεδομένων — αντίγραφα ασφαλείας και αρχείο για τον λογιστή. */
import { formatDate } from '../../../core/format'
import type { Category, Expense, ExpenseSettings, Recurring } from '../types'
import { KIND_LABEL, PAYMENT_LABEL } from '../types'
import { netFromGross, vatFromGross } from './recurring'

export interface BackupFile {
  app: 'personal-hub'
  module: 'expenses'
  version: 1
  exportedAt: string
  expenses: Expense[]
  categories: Category[]
  recurring: Recurring[]
  settings?: ExpenseSettings
}

export function buildBackup(
  expenses: Expense[], categories: Category[], recurring: Recurring[], settings: ExpenseSettings,
): BackupFile {
  return {
    app: 'personal-hub',
    module: 'expenses',
    version: 1,
    exportedAt: new Date().toISOString(),
    // Οι φωτογραφίες αποδείξεων δεν μπαίνουν στο JSON (μέγεθος)· μένουν τοπικά.
    expenses: expenses.map(({ receiptId: _r, ...rest }) => rest as Expense),
    categories,
    recurring,
    settings,
  }
}

export function parseBackup(text: string): BackupFile {
  const data = JSON.parse(text) as Partial<BackupFile>
  if (data.app !== 'personal-hub' || data.module !== 'expenses' || !Array.isArray(data.expenses)) {
    throw new Error('Το αρχείο δεν είναι αντίγραφο ασφαλείας των εξόδων.')
  }
  return data as BackupFile
}

const CSV_HEADER = [
  'Ημερομηνία', 'Τύπος', 'Κατηγορία', 'Κατάστημα', 'ΑΦΜ', 'Παραστατικό',
  'Καθαρή αξία', 'ΦΠΑ %', 'ΦΠΑ €', 'Σύνολο €', 'Τρόπος πληρωμής', 'Σημειώσεις', 'Απόδειξη',
]

/** CSV με ελληνικά headers και υποδιαστολή κόμμα (ανοίγει σωστά στο Excel). */
export function toCSV(rows: Expense[], categoryById: Map<string, Category>): string {
  const sep = ';'
  const esc = (v: string | number) => {
    const s = String(v ?? '')
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const dec = (n: number) => n.toFixed(2).replace('.', ',')

  const lines = [CSV_HEADER.join(sep)]
  for (const e of [...rows].sort((a, b) => (a.date < b.date ? -1 : 1))) {
    const rate = e.vatRate ?? 0
    const vat = e.vatAmount ?? (rate ? vatFromGross(e.amount, rate) : 0)
    lines.push([
      formatDate(e.date),
      KIND_LABEL[e.kind],
      categoryById.get(e.categoryId)?.name ?? '',
      e.merchant,
      e.taxId ?? '',
      e.docNumber ?? '',
      dec(rate ? netFromGross(e.amount, rate) : e.amount - vat),
      rate ? String(rate) : '',
      dec(vat),
      dec(e.amount),
      PAYMENT_LABEL[e.paymentMethod],
      (e.notes ?? '').replace(/\n/g, ' '),
      e.receiptId ? 'ναι' : '',
    ].map(esc).join(sep))
  }
  // BOM ώστε το Excel να διαβάσει σωστά τα ελληνικά.
  return '﻿' + lines.join('\r\n')
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
