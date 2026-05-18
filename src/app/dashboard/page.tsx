'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Target,
  Zap,
  Plus,
  Coffee,
  Sun,
  Moon,
  Apple,
  Utensils,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { FoodSearch } from '@/components/food/FoodSearch'
import { useStore } from '@/hooks/useStore'
import { cn, sumNutrition, getDailyDiaryEntries, formatDate } from '@/lib/utils'
import type { MealType } from '@/types'
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

// ─── MacroBar ────────────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string
  value: number
  goal: number
  barColor: string
}

function MacroBar({ label, value, goal, barColor }: MacroBarProps) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">
          {Math.round(value * 10) / 10}g&nbsp;/&nbsp;{goal}g
        </span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    profile,
    locale,
    selectedDate,
    setSelectedDate,
    diaryEntries,
    waterEntries,
    exerciseEntries,
  } = useStore()

  const t       = locale === 'el' ? elMessages.dashboard : enMessages.dashboard
  const tDiary  = locale === 'el' ? elMessages.diary     : enMessages.diary
  const tWater  = locale === 'el' ? elMessages.water     : enMessages.water
  const tCommon = locale === 'el' ? elMessages.common    : enMessages.common

  const [activeMeal, setActiveMeal] = React.useState<MealType>('breakfast')
  const [foodSearchOpen, setFoodSearchOpen] = React.useState(false)

  // ── date helpers ──
  const todayStr = new Date().toISOString().split('T')[0]
  const isToday  = selectedDate === todayStr
  const displayDate = isToday ? tCommon.today : formatDate(selectedDate, locale)

  const goToPrev = () => setSelectedDate(addDays(selectedDate, -1))
  const goToNext = () => setSelectedDate(addDays(selectedDate, 1))
  const goToToday = () => setSelectedDate(todayStr)

  // ── nutrition ──
  const calorieGoal = profile?.daily_calorie_goal ?? 2000
  const goalProtein = Math.round((calorieGoal * 0.3) / 4)
  const goalCarbs   = Math.round((calorieGoal * 0.4) / 4)
  const goalFat     = Math.round((calorieGoal * 0.3) / 9)
  const goalFiber   = 30

  const dayEntries  = getDailyDiaryEntries(diaryEntries, selectedDate)
  const totals      = sumNutrition(dayEntries)

  const burned = exerciseEntries
    .filter((e) => e.date === selectedDate)
    .reduce((sum, e) => sum + (e.calories_burned ?? 0), 0)

  const remaining = Math.max(calorieGoal + burned - totals.calories, 0)

  // ── per-meal ──
  const mealTotals = MEAL_ORDER.reduce<Record<MealType, ReturnType<typeof sumNutrition>>>(
    (acc, m) => {
      acc[m] = sumNutrition(dayEntries.filter((e) => e.meal_type === m))
      return acc
    },
    {} as Record<MealType, ReturnType<typeof sumNutrition>>
  )

  // ── water ──
  const waterGoalMl    = profile?.daily_water_goal_ml ?? 2000
  const totalWaterMl   = waterEntries
    .filter((e) => e.date === selectedDate)
    .reduce((sum, e) => sum + e.amount_ml, 0)
  const glassesTotal   = Math.ceil(waterGoalMl / 250)
  const glassesDone    = Math.floor(totalWaterMl / 250)

  // ── user name ──
  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? ''

  const openSearch = (meal: MealType) => {
    setActiveMeal(meal)
    setFoodSearchOpen(true)
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <PageHeader
        title={`${t.greeting}${firstName ? `, ${firstName}` : ''}!`}
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

        {/* ── Calorie Ring ── */}
        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-5">
            <ProgressRing
              value={totals.calories}
              max={calorieGoal + burned}
              size={200}
              strokeWidth={16}
              color="#f97316"
              backgroundColor="#ffedd5"
            >
              <div className="flex flex-col items-center select-none">
                <span className="text-4xl font-extrabold tracking-tight text-gray-900 leading-none">
                  {remaining}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 font-medium">
                  kcal {t.remaining.toLowerCase()}
                </span>
              </div>
            </ProgressRing>

            {/* 3-stat row */}
            <div className="flex justify-around w-full mt-6 pt-5 border-t border-gray-100">
              {/* Goal */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold">{t.goal}</span>
                </div>
                <span className="text-lg font-extrabold text-gray-900">{calorieGoal}</span>
                <span className="text-[10px] text-gray-400">kcal</span>
              </div>

              <div className="w-px bg-gray-100 self-stretch" />

              {/* Consumed */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-center gap-1.5 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-semibold">{t.consumed}</span>
                </div>
                <span className="text-lg font-extrabold text-gray-900">{totals.calories}</span>
                <span className="text-[10px] text-gray-400">kcal</span>
              </div>

              <div className="w-px bg-gray-100 self-stretch" />

              {/* Burned */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-center gap-1.5 text-blue-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-semibold">{t.burned}</span>
                </div>
                <span className="text-lg font-extrabold text-gray-900">{burned}</span>
                <span className="text-[10px] text-gray-400">kcal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Macros ── */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-900">{t.macros}</h2>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <MacroBar label={t.protein} value={totals.protein} goal={goalProtein} barColor="#3b82f6" />
            <MacroBar label={t.carbs}   value={totals.carbs}   goal={goalCarbs}   barColor="#eab308" />
            <MacroBar label={t.fat}     value={totals.fat}     goal={goalFat}     barColor="#ef4444" />
            <MacroBar label={t.fiber}   value={0}              goal={goalFiber}   barColor="#22c55e" />
          </CardContent>
        </Card>

        {/* ── Water Widget ── */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-bold text-gray-900">{tWater.title}</h2>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {totalWaterMl}&nbsp;/&nbsp;{waterGoalMl} ml
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: glassesTotal }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    i < glassesDone
                      ? 'bg-sky-500 text-white'
                      : 'bg-sky-100 text-sky-300'
                  )}
                >
                  <Droplets className="w-4 h-4" />
                </div>
              ))}
            </div>

            <div className="h-2 w-full bg-sky-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((totalWaterMl / Math.max(waterGoalMl, 1)) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Meals ── */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3 px-1">{t.todaysMeals}</h2>
          <div className="space-y-3">
            {MEAL_ORDER.map((meal) => {
              const accent   = MEAL_ACCENT[meal]
              const label    = tDiary[meal]
              const stats    = mealTotals[meal]
              const entries  = dayEntries.filter((e) => e.meal_type === meal)

              return (
                <Card key={meal}>
                  <CardContent className="pt-4 pb-4">
                    {/* Meal header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-xl', accent.bg, accent.text)}>
                          {MEAL_ICONS[meal]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">
                            {label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {stats.calories > 0
                              ? `${stats.calories} kcal · ${Math.round(stats.protein * 10) / 10}g P · ${Math.round(stats.carbs * 10) / 10}g C · ${Math.round(stats.fat * 10) / 10}g F`
                              : tDiary.noEntries}
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
                        {t.quickAdd}
                      </Button>
                    </div>

                    {/* Entry preview */}
                    {entries.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        {entries.slice(0, 4).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600 truncate max-w-[65%]">
                              {entry.food?.name ?? (locale === 'el' ? 'Τροφή' : 'Food')}
                              <span className="text-gray-400 ml-1">({entry.amount_g}g)</span>
                            </span>
                            <span className="font-semibold text-gray-800">
                              {entry.calories} kcal
                            </span>
                          </div>
                        ))}
                        {entries.length > 4 && (
                          <p className="text-xs text-gray-400 pl-0.5">
                            +{entries.length - 4}&nbsp;{locale === 'el' ? 'ακόμα' : 'more'}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
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
