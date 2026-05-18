'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Flame,
  Dumbbell,
  Wind,
  Zap,
  Trophy,
  HelpCircle,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useStore } from '@/hooks/useStore'
import { cn, formatDate, generateId } from '@/lib/utils'
import type { ExerciseEntry } from '@/types'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

// ─── types ────────────────────────────────────────────────────────────────────

type Category = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'

interface FormState {
  name: string
  category: Category
  duration_minutes: string
  calories_burned: string
}

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  cardio:      <Wind       className="w-4 h-4" />,
  strength:    <Dumbbell   className="w-4 h-4" />,
  flexibility: <Zap        className="w-4 h-4" />,
  sports:      <Trophy     className="w-4 h-4" />,
  other:       <HelpCircle className="w-4 h-4" />,
}

const CATEGORY_COLORS: Record<Category, string> = {
  cardio:      'bg-red-50    text-red-500',
  strength:    'bg-blue-50   text-blue-600',
  flexibility: 'bg-purple-50 text-purple-500',
  sports:      'bg-amber-50  text-amber-500',
  other:       'bg-gray-100  text-gray-500',
}

const DEFAULT_FORM: FormState = {
  name: '',
  category: 'cardio',
  duration_minutes: '',
  calories_burned: '',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface ExerciseRowProps {
  entry: ExerciseEntry
  onDelete: () => void
  t: typeof elMessages.exercise
  tCommon: typeof elMessages.common
}

function ExerciseRow({ entry, onDelete, t, tCommon }: ExerciseRowProps) {
  const cat        = (entry.category ?? 'other') as Category
  const icon       = CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.other
  const colorClass = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other
  const catLabel   = t.categories[cat as keyof typeof t.categories] ?? cat

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={cn('p-2.5 rounded-xl shrink-0', colorClass)}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{entry.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colorClass)}>
            {catLabel}
          </span>
          {entry.duration_minutes != null && (
            <span className="text-xs text-gray-500">
              {entry.duration_minutes} {t.minutes}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {entry.calories_burned != null && (
          <div className="flex items-center gap-1 bg-green-50 rounded-xl px-2.5 py-1.5">
            <Flame className="w-3.5 h-3.5 text-green-500" />
            <span className="text-sm font-bold text-green-600">{entry.calories_burned}</span>
            <span className="text-[10px] text-green-400">{t.kcal}</span>
          </div>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
          aria-label={tCommon.delete}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ t, locale }: { t: typeof elMessages.exercise; locale: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="bg-green-50 rounded-full p-6 mb-4">
        <Dumbbell className="w-12 h-12 text-green-300" />
      </div>
      <h3 className="text-base font-bold text-gray-700 mb-1.5">{t.noExercises}</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        {locale === 'el'
          ? 'Πάτα το κουμπί παρακάτω για να καταγράψεις την πρώτη σου άσκηση!'
          : 'Tap the button above to log your first exercise today!'}
      </p>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ExercisePage() {
  const {
    locale,
    selectedDate,
    setSelectedDate,
    exerciseEntries,
    addExerciseEntry,
    removeExerciseEntry,
  } = useStore()

  const t       = locale === 'el' ? elMessages.exercise : enMessages.exercise
  const tCommon = locale === 'el' ? elMessages.common   : enMessages.common
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = React.useState(false)
  const [form, setForm]           = React.useState<FormState>(DEFAULT_FORM)
  const [errors, setErrors]       = React.useState<Partial<FormState>>({})

  // ── date helpers ──
  const todayStr    = new Date().toISOString().split('T')[0]
  const isToday     = selectedDate === todayStr
  const displayDate = isToday ? tCommon.today : formatDate(selectedDate, locale)

  // ── filtered data ──
  const dayEntries  = exerciseEntries.filter((e) => e.date === selectedDate)
  const totalBurned = dayEntries.reduce((acc, e) => acc + (e.calories_burned ?? 0), 0)

  // ── category options ──
  const categoryOptions = [
    { value: 'cardio',      label: t.categories.cardio      },
    { value: 'strength',    label: t.categories.strength    },
    { value: 'flexibility', label: t.categories.flexibility },
    { value: 'sports',      label: t.categories.sports      },
    { value: 'other',       label: t.categories.other       },
  ]

  const openModal = () => {
    setForm(DEFAULT_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {}
    if (!form.name.trim()) {
      newErrors.name = locale === 'el' ? 'Απαιτείται όνομα' : 'Name is required'
    }
    if (form.duration_minutes && isNaN(Number(form.duration_minutes))) {
      newErrors.duration_minutes = locale === 'el' ? 'Μη έγκυρος αριθμός' : 'Invalid number'
    }
    if (form.calories_burned && isNaN(Number(form.calories_burned))) {
      newErrors.calories_burned = locale === 'el' ? 'Μη έγκυρος αριθμός' : 'Invalid number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const entry: ExerciseEntry = {
      id:               generateId(),
      user_id:          'local',
      date:             selectedDate,
      name:             form.name.trim(),
      category:         form.category,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      calories_burned:  form.calories_burned  ? Number(form.calories_burned)  : undefined,
      created_at:       new Date().toISOString(),
    }

    addExerciseEntry(entry)
    setModalOpen(false)
    showToast(
      locale === 'el' ? `"${entry.name}" προστέθηκε` : `"${entry.name}" added`,
      'success',
    )
  }

  const handleDelete = (entry: ExerciseEntry) => {
    removeExerciseEntry(entry.id)
    showToast(
      locale === 'el' ? `"${entry.name}" διαγράφηκε` : `"${entry.name}" removed`,
      'success',
    )
  }

  return (
    <AppShell>
      {/* ── Header with date navigation ── */}
      <PageHeader
        title={t.title}
        subtitle={displayDate}
        action={
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs font-bold text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
              >
                {tCommon.today}
              </button>
            )}
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-4 pb-8">

        {/* ── Total calories burned banner ── */}
        <Card className="bg-green-500 border-green-500 shadow-md shadow-green-200">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t.totalBurned}</p>
                <p className="text-4xl font-extrabold text-white mt-1 leading-none">
                  {totalBurned}
                  <span className="text-xl font-semibold text-green-200 ml-1.5">{t.kcal}</span>
                </p>
                {dayEntries.length > 0 && (
                  <p className="text-green-200 text-xs mt-2">
                    {dayEntries.length}{' '}
                    {locale === 'el' ? 'ασκήσεις καταγεγραμμένες' : 'exercises logged'}
                  </p>
                )}
              </div>
              <div className="bg-green-400/60 rounded-2xl p-3.5">
                <Flame className="w-9 h-9 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Add exercise button ── */}
        <Button onClick={openModal} size="lg" className="w-full">
          <Plus className="w-5 h-5" />
          {t.addExercise}
        </Button>

        {/* ── Exercise list or empty state ── */}
        {dayEntries.length === 0 ? (
          <EmptyState t={t} locale={locale} />
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-gray-900 pb-1">
                {locale === 'el' ? 'Ασκήσεις' : 'Exercises'}{' '}
                <span className="font-normal text-gray-400 text-sm">
                  — {displayDate}
                </span>
              </h2>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              {dayEntries.map((entry) => (
                <ExerciseRow
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDelete(entry)}
                  t={t}
                  tCommon={tCommon}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Add Exercise Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t.addExercise}>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label={t.name}
            placeholder={locale === 'el' ? 'π.χ. Τρέξιμο' : 'e.g. Running'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />

          <Select
            label={t.category}
            options={categoryOptions}
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value as Category }))
            }
          />

          <Input
            label={t.duration}
            type="number"
            min="0"
            placeholder="30"
            value={form.duration_minutes}
            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
            error={errors.duration_minutes}
          />

          <Input
            label={`${t.caloriesBurned} (${locale === 'el' ? 'προαιρετικό' : 'optional'})`}
            type="number"
            min="0"
            placeholder="250"
            value={form.calories_burned}
            onChange={(e) => setForm((f) => ({ ...f, calories_burned: e.target.value }))}
            error={errors.calories_burned}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              {tCommon.cancel}
            </Button>
            <Button type="submit" className="flex-1">
              {tCommon.add}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
