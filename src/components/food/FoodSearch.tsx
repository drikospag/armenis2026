'use client'
import * as React from 'react'
import { Search, Plus, Barcode, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/hooks/useStore'
import { COMMON_FOODS } from '@/lib/utils'
import type { Food, MealType } from '@/types'
import { AddFoodForm } from './AddFoodForm'
import { BarcodeScanner } from './BarcodeScanner'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

interface FoodSearchProps {
  open: boolean
  onClose: () => void
  mealType: MealType
  date: string
}

export function FoodSearch({ open, onClose, mealType, date }: FoodSearchProps) {
  const [query, setQuery] = React.useState('')
  const [showCreate, setShowCreate] = React.useState(false)
  const [showScanner, setShowScanner] = React.useState(false)
  const [selectedFood, setSelectedFood] = React.useState<Food | null>(null)
  const { locale, customFoods } = useStore()
  const t = locale === 'el' ? { ...elMessages.food, ...elMessages.diary } : { ...enMessages.food, ...enMessages.diary }

  const allFoods = [...COMMON_FOODS, ...customFoods]
  const results = query.trim()
    ? allFoods.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.brand && f.brand.toLowerCase().includes(query.toLowerCase()))
      )
    : allFoods.slice(0, 20)

  const handleBarcodeFound = (barcode: string) => {
    setShowScanner(false)
    const food = allFoods.find((f) => f.barcode === barcode)
    if (food) {
      setSelectedFood(food)
    } else {
      setQuery(barcode)
    }
  }

  if (selectedFood) {
    return (
      <AddFoodForm
        food={selectedFood}
        mealType={mealType}
        date={date}
        onClose={() => {
          setSelectedFood(null)
          onClose()
        }}
        onBack={() => setSelectedFood(null)}
      />
    )
  }

  if (showCreate) {
    return (
      <Modal open={open} onClose={onClose} title={t.createCustom}>
        <CreateFoodForm
          onClose={() => {
            setShowCreate(false)
            onClose()
          }}
          onBack={() => setShowCreate(false)}
        />
      </Modal>
    )
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={t.title}>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowScanner(true)}
              className="shrink-0"
            >
              <Barcode className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                  {food.brand && <p className="text-xs text-gray-500">{food.brand}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {food.calories_per_100g} kcal
                  </p>
                  <p className="text-xs text-gray-400">{t.per100g}</p>
                </div>
              </button>
            ))}

            {results.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">{t.noResults}</p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4" />
            {t.createCustom}
          </Button>
        </div>
      </Modal>

      {showScanner && (
        <BarcodeScanner
          onFound={handleBarcodeFound}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}

function CreateFoodForm({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [form, setForm] = React.useState({
    name: '', brand: '', barcode: '',
    calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '',
    fat_per_100g: '', fiber_per_100g: '', sugar_per_100g: '',
  })
  const { addCustomFood, locale } = useStore()
  const t = locale === 'el' ? elMessages.food : enMessages.food

  const handleSave = () => {
    if (!form.name || !form.calories_per_100g) return
    addCustomFood({
      id: Math.random().toString(36).slice(2),
      name: form.name,
      brand: form.brand || undefined,
      barcode: form.barcode || undefined,
      calories_per_100g: parseFloat(form.calories_per_100g),
      protein_per_100g: parseFloat(form.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
      fat_per_100g: parseFloat(form.fat_per_100g) || 0,
      fiber_per_100g: parseFloat(form.fiber_per_100g) || undefined,
      sugar_per_100g: parseFloat(form.sugar_per_100g) || undefined,
    })
    onClose()
  }

  const fields = [
    { key: 'name', label: t.name, type: 'text' },
    { key: 'brand', label: t.brand, type: 'text' },
    { key: 'barcode', label: t.barcode, type: 'text' },
    { key: 'calories_per_100g', label: t.calories, type: 'number' },
    { key: 'protein_per_100g', label: t.protein, type: 'number' },
    { key: 'carbs_per_100g', label: t.carbs, type: 'number' },
    { key: 'fat_per_100g', label: t.fat, type: 'number' },
    { key: 'fiber_per_100g', label: t.fiber, type: 'number' },
    { key: 'sugar_per_100g', label: t.sugar, type: 'number' },
  ]

  return (
    <div className="p-4 space-y-3">
      {fields.map(({ key, label, type }) => (
        <Input
          key={key}
          label={label}
          type={type}
          value={form[key as keyof typeof form]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ))}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          {locale === 'el' ? elMessages.common.cancel : enMessages.common.cancel}
        </Button>
        <Button className="flex-1" onClick={handleSave}>
          {t.save}
        </Button>
      </div>
    </div>
  )
}
