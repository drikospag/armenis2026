'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Apple,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FoodSearch } from '@/components/food/FoodSearch'
import { useToast } from '@/components/ui/toast'
import { useStore } from '@/hooks/useStore'
import { cn, sumNutrition, getDailyDiaryEntries, formatDate } from '@/lib/utils'
import type { MealType, DiaryEntry } from '@/types'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

// ─── constants ───────────────────────────────────────────────────────────────

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-5 h-5" />,
  lunch: <Sun className="w-5 h-5" />,
  dinner: <Moon className="w-5 h-5" />,
  snack: <Apple className="w-5 h-5" />,
}

const MEAL_ACCENT: Record<MealType, { bg: string; text: string }> = {
  breakfast: { bg: 'bg-amber-50', text: 'text-amber-500' },
  lunch: { bg: 'bg-orange-50', text: 'text-orange-500' },
  dinner: { bg: 'bg-indigo-50', text: 'text-indigo-500' },
  snack: { bg: 'bg-green-50', text: 'text-green-600' },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

// ─── DiaryEntryRow ───────────────────────────────────────────────────────────

interface DiaryEntryRowProps {
  entry: DiaryEntry
  onDelete: () => void
  deleteLabel: string
}

function DiaryEntryRow({ entry, onDelete, deleteLabel }: DiaryEntryRowProps) {
  const [swiped, setSwiped] = React.useState(false)
  const startX = React.useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = startX.current - e.changedTouches[0].clientX
    if (dx > 55) setSwiped(true)
    else if (dx < -20) setSwiped(false)
    startX.current = null
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Red delete backdrop revealed on swipe */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 rounded-xl transition-all duration-200',
          swiped ? 'w-16 opacity-100' : 'w-0 opacity-0'
        )}
      >
        <button
          onClick={onDelete}
          className="text-white p-1"
          aria-label={deleteLabel}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main content — slides left when swiped */}
      <div
        className={cn(
          'flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 transition-transform duration-200',
          swiped && '-translate-x-16'
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate leading-snug">
            {entry.food?.name ?? (entry.food_id)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {entry.amount_g}g&nbsp;&middot;&nbsp;
            <span className="text-blue-500">{round1(entry.protein)}g P</span>&nbsp;&middot;&nbsp;
            <span className="text-yellow-500">{round1(entry.carbs)}g C</span>&nbsp;&middot;&nbsp;
            <span className="text-red-400">{round1(entry.fat)}g F</span>
          </p>
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-sm font-bold text-gray-800">{entry.calories}&nbsp;kcal</span>
          {/* Trash icon always visible (alternative to swipe on desktop) */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
            aria-label={deleteLabel}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── TotalStat ───────────────────────────────────────────────────────────────

interface TotalStatProps {
  label: string
  value: string
  color: string
  bgColor: string
}

function TotalStat({ label, value, color, bgColor }: TotalStatProps) {
  return (
    <div className={cn('rounded-2xl p-4', bgColor)}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn('text-xl font-extrabold', color)}>{value}</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DiaryPage() {
  const {
    locale,
    selectedDate,
    setSelectedDate,
    diaryEntries,
    removeDiaryEntry,
  } = useStore()

  const t       = locale === 'el' ? elMessages.diary  : enMessages.diary
  const tCommon = locale === 'el' ? elMessages.common : enMessages.common

  const { showToast } = useToast()

  const [activeMeal, setActiveMeal] = React.useState<MealType>('breakfast')
  const [foodSearchOpen, setFoodSearchOpen] = React.useState(false)

  // ── date helpers ──
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday  = selectedDate === todayStr
  const displayDate = isToday ? tCommon.today : formatDate(selectedDate, locale)

  const goToPrev = () => setSelectedDate(addDays(selectedDate, -1))
  const goToNext = () => setSelectedDate(addDays(selectedDate, 1))
  const goToToday = () => setSelectedDate(todayStr)

  // ── data ──
  const dayEntries = getDailyDiaryEntries(diaryEntries, selectedDate)
  const totals     = sumNutrition(dayEntries)

  const openSearch = (meal: MealType) => {
    setActiveMeal(meal)
    setFoodSearchOpen(true)
  }

  const handleDelete = (entry: DiaryEntry) => {
    removeDiaryEntry(entry.id)
    const name = entry.food?.name ?? (locale === 'el' ? 'Τροφή' : 'Food')
    showToast(
      locale === 'el' ? `"${name}" διαγράφηκε` : `"${name}" removed`,
      'success'
    )
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <PageHeader
        title={t.title}
        subtitle={displayDate}
        action={
          <div className="flex items-center gap-0.5">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-xs font-bold text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
              >
                {tCommon.today}
              </button>
            )}
            <button
              onClick={goToNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-4 pb-8">

        {/* ── Meal sections ── */}
        {MEAL_ORDER.map((meal) => {
          const accent  = MEAL_ACCENT[meal]
          const label   = t[meal]
          const entries = dayEntries.filter((e) => e.meal_type === meal)
          const stats   = sumNutrition(entries)

          return (
            <Card key={meal}>
              {/* Card header row */}
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-xl', accent.bg, accent.text)}>
                      {MEAL_ICONS[meal]}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm leading-tight">{label}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entries.length > 0
                          ? `${stats.calories} kcal`
                          : t.noEntries}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openSearch(meal)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    {t.add}
                  </Button>
                </div>
              </CardHeader>

              {/* Entry list */}
              {entries.length > 0 && (
                <CardContent className="pt-3 space-y-2">
                  {entries.map((entry) => (
                    <DiaryEntryRow
                      key={entry.id}
                      entry={entry}
                      onDelete={() => handleDelete(entry)}
                      deleteLabel={t.delete}
                    />
                  ))}

                  {/* Meal subtotal */}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {t.total}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-gray-800">{stats.calories} kcal</span>
                      <span className="text-blue-500">{round1(stats.protein)}g P</span>
                      <span className="text-yellow-500">{round1(stats.carbs)}g C</span>
                      <span className="text-red-400">{round1(stats.fat)}g F</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        {/* ── Daily totals card ── */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h2 className="font-bold text-gray-900 text-base mb-4">
              {locale === 'el' ? 'Ημερήσιο Σύνολο' : 'Daily Total'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <TotalStat
                label={t.calories}
                value={`${totals.calories} kcal`}
                color="text-orange-500"
                bgColor="bg-orange-50"
              />
              <TotalStat
                label={t.protein}
                value={`${round1(totals.protein)} g`}
                color="text-blue-500"
                bgColor="bg-blue-50"
              />
              <TotalStat
                label={t.carbs}
                value={`${round1(totals.carbs)} g`}
                color="text-yellow-500"
                bgColor="bg-yellow-50"
              />
              <TotalStat
                label={t.fat}
                value={`${round1(totals.fat)} g`}
                color="text-red-500"
                bgColor="bg-red-50"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FoodSearch Modal ── */}
      <FoodSearch
        open={foodSearchOpen}
        onClose={() => setFoodSearchOpen(false)}
        mealType={activeMeal}
        date={selectedDate}
      />
    </AppShell>
  )
}
