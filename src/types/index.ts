export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  height_cm?: number
  current_weight_kg?: number
  target_weight_kg?: number
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose' | 'maintain' | 'gain'
  daily_calorie_goal?: number
  daily_water_goal_ml?: number
  created_at?: string
  updated_at?: string
}

export interface Food {
  id: string
  user_id?: string
  name: string
  brand?: string
  barcode?: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  is_verified?: boolean
  created_at?: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface DiaryEntry {
  id: string
  user_id: string
  food_id: string
  food?: Food
  date: string
  meal_type: MealType
  amount_g: number
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at?: string
}

export interface WaterEntry {
  id: string
  user_id: string
  date: string
  amount_ml: number
  created_at?: string
}

export interface ExerciseEntry {
  id: string
  user_id: string
  date: string
  name: string
  duration_minutes?: number
  calories_burned?: number
  category?: string
  created_at?: string
}

export interface WeightEntry {
  id: string
  user_id: string
  date: string
  weight_kg: number
  notes?: string
  created_at?: string
}

export interface DailyNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  goal_calories: number
  goal_protein: number
  goal_carbs: number
  goal_fat: number
}

export interface DayData {
  date: string
  nutrition: DailyNutrition
  water_ml: number
  water_goal_ml: number
  calories_burned: number
  diary_entries: DiaryEntry[]
  water_entries: WaterEntry[]
  exercise_entries: ExerciseEntry[]
}
