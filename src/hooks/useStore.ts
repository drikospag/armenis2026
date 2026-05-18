'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, DiaryEntry, WaterEntry, ExerciseEntry, WeightEntry, Food } from '@/types'

interface AppState {
  profile: Profile | null
  locale: string
  selectedDate: string
  diaryEntries: DiaryEntry[]
  waterEntries: WaterEntry[]
  exerciseEntries: ExerciseEntry[]
  weightEntries: WeightEntry[]
  customFoods: Food[]

  setProfile: (profile: Profile | null) => void
  setLocale: (locale: string) => void
  setSelectedDate: (date: string) => void
  addDiaryEntry: (entry: DiaryEntry) => void
  removeDiaryEntry: (id: string) => void
  updateDiaryEntry: (id: string, entry: Partial<DiaryEntry>) => void
  addWaterEntry: (entry: WaterEntry) => void
  removeWaterEntry: (id: string) => void
  addExerciseEntry: (entry: ExerciseEntry) => void
  removeExerciseEntry: (id: string) => void
  addWeightEntry: (entry: WeightEntry) => void
  removeWeightEntry: (id: string) => void
  addCustomFood: (food: Food) => void
  updateCustomFood: (id: string, food: Partial<Food>) => void
  removeCustomFood: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      locale: 'el',
      selectedDate: new Date().toISOString().split('T')[0],
      diaryEntries: [],
      waterEntries: [],
      exerciseEntries: [],
      weightEntries: [],
      customFoods: [],

      setProfile: (profile) => set({ profile }),
      setLocale: (locale) => set({ locale }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      addDiaryEntry: (entry) =>
        set((s) => ({ diaryEntries: [...s.diaryEntries, entry] })),
      removeDiaryEntry: (id) =>
        set((s) => ({ diaryEntries: s.diaryEntries.filter((e) => e.id !== id) })),
      updateDiaryEntry: (id, entry) =>
        set((s) => ({
          diaryEntries: s.diaryEntries.map((e) => (e.id === id ? { ...e, ...entry } : e)),
        })),

      addWaterEntry: (entry) =>
        set((s) => ({ waterEntries: [...s.waterEntries, entry] })),
      removeWaterEntry: (id) =>
        set((s) => ({ waterEntries: s.waterEntries.filter((e) => e.id !== id) })),

      addExerciseEntry: (entry) =>
        set((s) => ({ exerciseEntries: [...s.exerciseEntries, entry] })),
      removeExerciseEntry: (id) =>
        set((s) => ({ exerciseEntries: s.exerciseEntries.filter((e) => e.id !== id) })),

      addWeightEntry: (entry) =>
        set((s) => ({ weightEntries: [entry, ...s.weightEntries] })),
      removeWeightEntry: (id) =>
        set((s) => ({ weightEntries: s.weightEntries.filter((e) => e.id !== id) })),

      addCustomFood: (food) =>
        set((s) => ({ customFoods: [...s.customFoods, food] })),
      updateCustomFood: (id, food) =>
        set((s) => ({
          customFoods: s.customFoods.map((f) => (f.id === id ? { ...f, ...food } : f)),
        })),
      removeCustomFood: (id) =>
        set((s) => ({ customFoods: s.customFoods.filter((f) => f.id !== id) })),
    }),
    { name: 'nutritrack-store' }
  )
)
