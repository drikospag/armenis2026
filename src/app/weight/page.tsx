'use client'

import * as React from 'react'
import {
  Plus,
  Trash2,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Target,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useStore } from '@/hooks/useStore'
import { cn, formatDate, generateId, calculateBMI, getBMICategory } from '@/lib/utils'
import type { WeightEntry } from '@/types'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatChartDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  } catch {
    return dateStr
  }
}

function getBMIColor(bmi: number): string {
  if (bmi < 18.5) return 'text-blue-500'
  if (bmi < 25)   return 'text-green-500'
  if (bmi < 30)   return 'text-amber-500'
  return 'text-red-500'
}

function getBMIBadgeClass(bmi: number): string {
  if (bmi < 18.5) return 'bg-blue-50 text-blue-500'
  if (bmi < 25)   return 'bg-green-50 text-green-600'
  if (bmi < 30)   return 'bg-amber-50 text-amber-600'
  return 'bg-red-50 text-red-500'
}

// ─── custom recharts tooltip ──────────────────────────────────────────────────

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  locale: string
}

function CustomTooltip({ active, payload, label, locale }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {payload[0].value}{' '}
        {locale === 'el' ? elMessages.weight.kg : enMessages.weight.kg}
      </p>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WeightPage() {
  const {
    profile,
    locale,
    weightEntries,
    addWeightEntry,
    removeWeightEntry,
  } = useStore()

  const t       = locale === 'el' ? elMessages.weight : enMessages.weight
  const tCommon = locale === 'el' ? elMessages.common : enMessages.common
  const { showToast } = useToast()

  const [modalOpen, setModalOpen]     = React.useState(false)
  const [weightInput, setWeightInput] = React.useState('')
  const [notesInput, setNotesInput]   = React.useState('')
  const [weightError, setWeightError] = React.useState('')

  // ── sorted entries (newest first) ──
  const sortedEntries = React.useMemo(
    () =>
      [...weightEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [weightEntries],
  )

  // ── chart: last 30 entries, oldest first for left→right flow ──
  const chartData = React.useMemo(
    () =>
      [...sortedEntries]
        .slice(0, 30)
        .reverse()
        .map((e) => ({
          date:   formatChartDate(e.date),
          weight: e.weight_kg,
        })),
    [sortedEntries],
  )

  // ── derived values ──
  const currentEntry  = sortedEntries[0]
  const startingEntry = sortedEntries[sortedEntries.length - 1]
  const currentWeight = currentEntry?.weight_kg ?? profile?.current_weight_kg
  const targetWeight  = profile?.target_weight_kg
  const heightCm      = profile?.height_cm
  const startWeight   = startingEntry?.weight_kg ?? profile?.current_weight_kg

  const bmi         = currentWeight && heightCm ? calculateBMI(currentWeight, heightCm) : null
  const bmiCategory = bmi ? getBMICategory(bmi, locale) : null

  const totalChange =
    currentWeight != null && startWeight != null
      ? Math.round((currentWeight - startWeight) * 10) / 10
      : null

  const progressPct = React.useMemo(() => {
    if (startWeight == null || targetWeight == null || currentWeight == null) return 0
    const total = Math.abs(targetWeight - startWeight)
    if (total === 0) return 100
    const done = Math.abs(currentWeight - startWeight)
    return Math.min(Math.round((done / total) * 100), 100)
  }, [startWeight, targetWeight, currentWeight])

  // ── chart y-axis domain with padding ──
  const weights = chartData.map((d) => d.weight)
  const yMin = weights.length ? Math.floor(Math.min(...weights) - 1) : 50
  const yMax = weights.length ? Math.ceil(Math.max(...weights)  + 1) : 100

  // ── modal handlers ──
  const openModal = () => {
    setWeightInput(currentWeight ? String(currentWeight) : '')
    setNotesInput('')
    setWeightError('')
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(weightInput)
    if (!weightInput || isNaN(val) || val < 10 || val > 500) {
      setWeightError(locale === 'el' ? 'Εισάγετε έγκυρο βάρος' : 'Enter a valid weight')
      return
    }
    const entry: WeightEntry = {
      id:         generateId(),
      user_id:    'local',
      date:       new Date().toISOString().split('T')[0],
      weight_kg:  Math.round(val * 10) / 10,
      notes:      notesInput.trim() || undefined,
      created_at: new Date().toISOString(),
    }
    addWeightEntry(entry)
    setModalOpen(false)
    showToast(
      locale === 'el' ? `${entry.weight_kg} kg καταγράφηκε` : `${entry.weight_kg} kg logged`,
      'success',
    )
  }

  const handleDelete = (entry: WeightEntry) => {
    removeWeightEntry(entry.id)
    showToast(
      locale === 'el' ? 'Καταχώρηση διαγράφηκε' : 'Entry removed',
      'success',
    )
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <PageHeader
        title={t.title}
        action={
          <Button size="sm" onClick={openModal}>
            <Plus className="w-4 h-4" />
            {t.log}
          </Button>
        }
      />

      <div className="px-4 space-y-4 pb-8">

        {/* ── Current weight card ── */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-2xl p-3.5 shrink-0">
                <Scale className="w-8 h-8 text-green-500" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-0.5">{t.current}</p>
                {currentWeight ? (
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">
                    {currentWeight}
                    <span className="text-base font-semibold text-gray-400 ml-1.5">{t.kg}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">{tCommon.noData}</p>
                )}
              </div>

              {targetWeight && (
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-indigo-500 mb-0.5">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{t.target}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {targetWeight}
                    <span className="text-sm font-normal text-gray-400 ml-0.5">{t.kg}</span>
                  </p>
                </div>
              )}
            </div>

            {/* BMI */}
            {bmi && bmiCategory && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{t.bmi}</span>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xl font-extrabold', getBMIColor(bmi))}>{bmi}</span>
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', getBMIBadgeClass(bmi))}>
                    {bmiCategory}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Progress card ── */}
        {startWeight != null && targetWeight != null && currentWeight != null && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-gray-900 pb-1">{t.progress}</h2>
            </CardHeader>
            <CardContent className="pt-2 pb-5">
              {/* Labels row */}
              <div className="flex justify-between items-end mb-3 text-sm">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{t.startWeight}</p>
                  <p className="font-bold text-gray-600">{startWeight} {t.kg}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{t.current}</p>
                  <p className="font-extrabold text-green-600 text-base">{currentWeight} {t.kg}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{t.target}</p>
                  <p className="font-bold text-indigo-600">{targetWeight} {t.kg}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-right">{progressPct}%</p>

              {/* Lost / gained */}
              {totalChange !== null && (
                <div className="mt-3 flex items-center gap-2">
                  {totalChange < 0 ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : totalChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {t.lostGained}:{' '}
                    <span
                      className={cn(
                        'font-bold',
                        totalChange < 0
                          ? 'text-green-600'
                          : totalChange > 0
                          ? 'text-amber-500'
                          : 'text-gray-500',
                      )}
                    >
                      {totalChange > 0 ? '+' : ''}{totalChange} {t.kg}
                    </span>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Recharts trend chart ── */}
        {chartData.length >= 2 && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-gray-900 pb-1">{t.trend}</h2>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip locale={locale} />}
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ── History list (last 10) ── */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-900 pb-1">{t.history}</h2>
          </CardHeader>
          <CardContent className="pt-2">
            {sortedEntries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="bg-green-50 rounded-full p-4 mb-3">
                  <Scale className="w-8 h-8 text-green-200" />
                </div>
                <p className="text-sm text-gray-500">{t.noEntries}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedEntries.slice(0, 10).map((entry, idx) => {
                  const prev = sortedEntries[idx + 1]
                  const delta =
                    prev != null
                      ? Math.round((entry.weight_kg - prev.weight_kg) * 10) / 10
                      : null

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">
                          {formatDate(entry.date, locale)}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate italic">
                            {entry.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {delta !== null && (
                          <span
                            className={cn(
                              'text-xs font-medium px-1.5 py-0.5 rounded-lg',
                              delta < 0
                                ? 'bg-green-50 text-green-500'
                                : delta > 0
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-gray-100 text-gray-400',
                            )}
                          >
                            {delta > 0 ? '+' : ''}
                            {delta}
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-900">
                          {entry.weight_kg}
                          <span className="text-xs font-normal text-gray-400 ml-0.5">
                            {t.kg}
                          </span>
                        </span>
                        <button
                          onClick={() => handleDelete(entry)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                          aria-label={tCommon.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Log Weight Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t.addWeight}>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label={t.weight}
            type="number"
            step="0.1"
            min="10"
            max="500"
            placeholder="72.5"
            value={weightInput}
            onChange={(e) => {
              setWeightInput(e.target.value)
              setWeightError('')
            }}
            error={weightError}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {t.notes}{' '}
              <span className="font-normal text-gray-400">
                ({locale === 'el' ? 'προαιρετικό' : 'optional'})
              </span>
            </label>
            <textarea
              rows={2}
              placeholder={locale === 'el' ? 'π.χ. Μετά άσκηση' : 'e.g. After workout'}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5',
                'text-sm text-gray-900 placeholder:text-gray-400 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
              )}
            />
          </div>

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
              {tCommon.save}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
