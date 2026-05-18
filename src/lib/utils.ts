import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Food, DiaryEntry } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateNutrition(food: Food, amountG: number) {
  const factor = amountG / 100
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(food.fat_per_100g * factor * 10) / 10,
  }
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number, locale: string): string {
  if (locale === 'el') {
    if (bmi < 18.5) return 'Λιποβαρής'
    if (bmi < 25) return 'Φυσιολογικό'
    if (bmi < 30) return 'Υπέρβαρος'
    return 'Παχύσαρκος'
  }
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function calculateTDEE(profile: {
  current_weight_kg?: number
  height_cm?: number
  date_of_birth?: string
  gender?: string
  activity_level?: string
  goal?: string
}): number {
  if (!profile.current_weight_kg || !profile.height_cm || !profile.date_of_birth) {
    return 2000
  }

  const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
  const w = profile.current_weight_kg
  const h = profile.height_cm

  let bmr: number
  if (profile.gender === 'female') {
    bmr = 10 * w + 6.25 * h - 5 * age - 161
  } else {
    bmr = 10 * w + 6.25 * h - 5 * age + 5
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const multiplier = activityMultipliers[profile.activity_level || 'moderate'] || 1.55
  let tdee = bmr * multiplier

  if (profile.goal === 'lose') tdee -= 500
  if (profile.goal === 'gain') tdee += 500

  return Math.round(tdee)
}

export function getDailyDiaryEntries(entries: DiaryEntry[], date: string): DiaryEntry[] {
  return entries.filter((e) => e.date === date)
}

export function sumNutrition(entries: DiaryEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const COMMON_FOODS: Food[] = [
  { id: 'f1', name: 'Κοτόπουλο στήθος', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, is_verified: true },
  { id: 'f2', name: 'Ρύζι βρασμένο', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, is_verified: true },
  { id: 'f3', name: 'Αυγό', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, is_verified: true },
  { id: 'f4', name: 'Ψωμί', calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, is_verified: true },
  { id: 'f5', name: 'Γάλα πλήρες', calories_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3, is_verified: true },
  { id: 'f6', name: 'Γιαούρτι στραγγιστό', calories_per_100g: 97, protein_per_100g: 9, carbs_per_100g: 3.6, fat_per_100g: 5, is_verified: true },
  { id: 'f7', name: 'Μπανάνα', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, is_verified: true },
  { id: 'f8', name: 'Μήλο', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, is_verified: true },
  { id: 'f9', name: 'Σολομός', calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, is_verified: true },
  { id: 'f10', name: 'Ελαιόλαδο', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, is_verified: true },
  { id: 'f11', name: 'Φασόλια', calories_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 22, fat_per_100g: 0.5, is_verified: true },
  { id: 'f12', name: 'Πατάτα βρασμένη', calories_per_100g: 87, protein_per_100g: 1.9, carbs_per_100g: 20, fat_per_100g: 0.1, is_verified: true },
  { id: 'f13', name: 'Τόνος κονσέρβα', calories_per_100g: 116, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 1, is_verified: true },
  { id: 'f14', name: 'Φέτα', calories_per_100g: 264, protein_per_100g: 14, carbs_per_100g: 4, fat_per_100g: 21, is_verified: true },
  { id: 'f15', name: 'Αμύγδαλα', calories_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50, is_verified: true },
  { id: 'f16', name: 'Ντομάτα', calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, is_verified: true },
  { id: 'f17', name: 'Αγγούρι', calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1, is_verified: true },
  { id: 'f18', name: 'Μακαρόνια βρασμένα', calories_per_100g: 158, protein_per_100g: 5.8, carbs_per_100g: 31, fat_per_100g: 0.9, is_verified: true },
  { id: 'f19', name: 'Chicken breast (EN)', brand: 'Generic', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, is_verified: true },
  { id: 'f20', name: 'Oats', brand: 'Generic', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 7, is_verified: true },
]
