'use client'
import * as React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/hooks/useStore'
import { calculateNutrition } from '@/lib/utils'
import type { Food, MealType } from '@/types'
import { useToast } from '@/components/ui/toast'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

interface AddFoodFormProps {
  food: Food
  mealType: MealType
  date: string
  onClose: () => void
  onBack: () => void
}

export function AddFoodForm({ food, mealType, date, onClose, onBack }: AddFoodFormProps) {
  const [amount, setAmount] = React.useState('100')
  const { addDiaryEntry, locale } = useStore()
  const { showToast } = useToast()
  const t = locale === 'el' ? elMessages.diary : enMessages.diary

  const amountNum = parseFloat(amount) || 0
  const nutrition = calculateNutrition(food, amountNum)

  const handleAdd = () => {
    if (!amountNum) return
    addDiaryEntry({
      id: Math.random().toString(36).slice(2),
      user_id: 'local',
      food_id: food.id,
      food,
      date,
      meal_type: mealType,
      amount_g: amountNum,
      ...nutrition,
    })
    showToast(locale === 'el' ? 'Προστέθηκε!' : 'Added!')
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">{food.name}</h2>
            {food.brand && <p className="text-sm text-gray-500">{food.brand}</p>}
          </div>
        </div>

        <Input
          label={t.amount}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          max="2000"
          autoFocus
        />

        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: t.calories, value: nutrition.calories, unit: 'kcal', color: 'text-orange-500' },
            { label: t.protein, value: nutrition.protein, unit: 'g', color: 'text-blue-500' },
            { label: t.carbs, value: nutrition.carbs, unit: 'g', color: 'text-yellow-500' },
            { label: t.fat, value: nutrition.fat, unit: 'g', color: 'text-red-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400">{unit}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            {t.cancel}
          </Button>
          <Button className="flex-1" onClick={handleAdd}>
            {t.add}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
