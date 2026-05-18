'use client'

import * as React from 'react'
import { Droplets, Trash2, Plus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgressRing } from '@/components/ui/progress-ring'
import { useToast } from '@/components/ui/toast'
import { useStore } from '@/hooks/useStore'
import { cn, formatDate, generateId } from '@/lib/utils'
import type { WaterEntry } from '@/types'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

// ─── constants ────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [150, 250, 330, 500] as const

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface WaterEntryRowProps {
  entry: WaterEntry
  onDelete: () => void
  tCommon: typeof elMessages.common
  tWater: typeof elMessages.water
}

function WaterEntryRow({ entry, onDelete, tCommon, tWater }: WaterEntryRowProps) {
  const time = entry.created_at ? formatTime(entry.created_at) : ''

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="bg-blue-100 rounded-xl p-2.5 shrink-0">
        <Droplets className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-600">
          +{entry.amount_ml} {tWater.ml}
        </p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
        aria-label={tCommon.delete}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WaterPage() {
  const {
    profile,
    locale,
    selectedDate,
    waterEntries,
    addWaterEntry,
    removeWaterEntry,
  } = useStore()

  const t       = locale === 'el' ? elMessages.water  : enMessages.water
  const tCommon = locale === 'el' ? elMessages.common : enMessages.common
  const { showToast } = useToast()

  const [customAmount, setCustomAmount] = React.useState('')

  // ── date helpers ──
  const todayStr    = new Date().toISOString().split('T')[0]
  const isToday     = selectedDate === todayStr
  const displayDate = isToday ? tCommon.today : formatDate(selectedDate, locale)

  // ── water goal & totals ──
  const waterGoal = profile?.daily_water_goal_ml ?? 2000

  const dayEntries = waterEntries
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))

  const totalMl      = dayEntries.reduce((acc, e) => acc + e.amount_ml, 0)
  const percentage   = Math.min(Math.round((totalMl / Math.max(waterGoal, 1)) * 100), 100)
  const totalGlasses = Math.ceil(waterGoal / 250)
  const filledGlasses = Math.floor(totalMl / 250)

  // ── actions ──
  const addWater = (amountMl: number) => {
    if (amountMl <= 0) return
    const entry: WaterEntry = {
      id:         generateId(),
      user_id:    'local',
      date:       selectedDate,
      amount_ml:  amountMl,
      created_at: new Date().toISOString(),
    }
    addWaterEntry(entry)
    showToast(
      locale === 'el' ? `+${amountMl} ml προστέθηκαν` : `+${amountMl} ml added`,
      'success',
    )
  }

  const handleCustomAdd = () => {
    const val = Number(customAmount)
    if (!customAmount || isNaN(val) || val <= 0) {
      showToast(
        locale === 'el' ? 'Εισάγετε έγκυρη ποσότητα' : 'Enter a valid amount',
        'error',
      )
      return
    }
    addWater(val)
    setCustomAmount('')
  }

  const handleDelete = (entry: WaterEntry) => {
    removeWaterEntry(entry.id)
    showToast(
      locale === 'el' ? 'Καταχώρηση διαγράφηκε' : 'Entry removed',
      'success',
    )
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <PageHeader title={t.title} subtitle={displayDate} />

      <div className="px-4 space-y-4 pb-8">

        {/* ── Progress Ring ── */}
        <Card>
          <CardContent className="pt-6 pb-5">
            <div className="flex flex-col items-center">
              <ProgressRing
                value={totalMl}
                max={waterGoal}
                size={180}
                strokeWidth={14}
                color="#3b82f6"
                backgroundColor="#dbeafe"
              >
                <div className="flex flex-col items-center select-none">
                  <span className="text-3xl font-extrabold text-gray-900 leading-none">
                    {totalMl}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 font-medium">{t.ml}</span>
                  <span
                    className={cn(
                      'text-sm font-bold mt-1',
                      percentage >= 100 ? 'text-green-500' : 'text-blue-500',
                    )}
                  >
                    {percentage}%
                  </span>
                </div>
              </ProgressRing>

              {/* Stats row */}
              <div className="flex justify-around w-full mt-5 pt-4 border-t border-gray-100">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-blue-500">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.daily}</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{totalMl}</span>
                  <span className="text-[10px] text-gray-400">{t.ml}</span>
                </div>

                <div className="w-px bg-gray-100 self-stretch" />

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-green-500">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.goal}</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{waterGoal}</span>
                  <span className="text-[10px] text-gray-400">{t.ml}</span>
                </div>

                <div className="w-px bg-gray-100 self-stretch" />

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-indigo-500">
                    <span className="text-sm">🥛</span>
                    <span className="text-xs font-medium">{t.glasses}</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">
                    {filledGlasses}
                    <span className="text-xs font-normal text-gray-400">/{totalGlasses}</span>
                  </span>
                  <span className="text-[10px] text-gray-400">{t.glasses}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Glass visual ── */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {filledGlasses} / {totalGlasses} {t.glasses}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalGlasses }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-300',
                    i < filledGlasses
                      ? 'bg-blue-500 shadow-sm shadow-blue-200 scale-105'
                      : 'bg-blue-100',
                  )}
                >
                  <span>{i < filledGlasses ? '🥛' : '🫙'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Quick Add ── */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-900 pb-1">{t.quickAdd}</h2>
          </CardHeader>
          <CardContent className="pt-2">
            {/* Quick-add buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl py-3 px-1',
                    'bg-blue-50 hover:bg-blue-100 active:bg-blue-200',
                    'text-blue-600 font-semibold transition-all',
                    'border-2 border-transparent hover:border-blue-200',
                  )}
                >
                  <Droplets className="w-5 h-5 mb-1" />
                  <span className="text-sm font-bold">{amount}</span>
                  <span className="text-[10px] text-blue-400">{t.ml}</span>
                </button>
              ))}
            </div>

            {/* Custom amount row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  placeholder={t.amount}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAdd() }}
                />
              </div>
              <Button onClick={handleCustomAdd} className="shrink-0">
                <Plus className="w-4 h-4" />
                {t.add}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Today's log ── */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-900 pb-1">{t.history}</h2>
          </CardHeader>
          <CardContent className="pt-2">
            {dayEntries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="bg-blue-50 rounded-full p-4 mb-3">
                  <Droplets className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-sm text-gray-500">{t.noEntries}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...dayEntries].reverse().map((entry) => (
                  <WaterEntryRow
                    key={entry.id}
                    entry={entry}
                    onDelete={() => handleDelete(entry)}
                    tCommon={tCommon}
                    tWater={t}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
