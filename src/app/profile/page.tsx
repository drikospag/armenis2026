'use client'
import * as React from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useStore } from '@/hooks/useStore'
import { calculateTDEE } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { Globe, User, Target, Settings, LogOut } from 'lucide-react'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

export default function ProfilePage() {
  const { profile, setProfile, locale, setLocale } = useStore()
  const { showToast } = useToast()

  const t = locale === 'el' ? elMessages.profile : enMessages.profile
  const tCommon = locale === 'el' ? elMessages.common : enMessages.common

  const [form, setForm] = React.useState({
    full_name: profile?.full_name || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || 'male',
    height_cm: profile?.height_cm?.toString() || '',
    current_weight_kg: profile?.current_weight_kg?.toString() || '',
    target_weight_kg: profile?.target_weight_kg?.toString() || '',
    activity_level: profile?.activity_level || 'moderate',
    goal: profile?.goal || 'maintain',
    daily_water_goal_ml: profile?.daily_water_goal_ml?.toString() || '2000',
  })

  const estimatedCalories = React.useMemo(() => {
    return calculateTDEE({
      current_weight_kg: parseFloat(form.current_weight_kg) || undefined,
      height_cm: parseFloat(form.height_cm) || undefined,
      date_of_birth: form.date_of_birth || undefined,
      gender: form.gender,
      activity_level: form.activity_level,
      goal: form.goal,
    })
  }, [form])

  const [calorieGoal, setCalorieGoal] = React.useState(
    profile?.daily_calorie_goal?.toString() || ''
  )

  React.useEffect(() => {
    if (!profile?.daily_calorie_goal) {
      setCalorieGoal(estimatedCalories.toString())
    }
  }, [estimatedCalories, profile?.daily_calorie_goal])

  const handleSave = () => {
    setProfile({
      id: profile?.id || 'local',
      ...form,
      height_cm: parseFloat(form.height_cm) || undefined,
      current_weight_kg: parseFloat(form.current_weight_kg) || undefined,
      target_weight_kg: parseFloat(form.target_weight_kg) || undefined,
      daily_calorie_goal: parseInt(calorieGoal) || estimatedCalories,
      daily_water_goal_ml: parseInt(form.daily_water_goal_ml) || 2000,
      gender: form.gender as 'male' | 'female' | 'other',
      activity_level: form.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
      goal: form.goal as 'lose' | 'maintain' | 'gain',
    })
    showToast(t.saved, 'success')
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <AppShell>
      <PageHeader title={t.title} />
      <div className="px-4 space-y-4 pb-6">

        {/* Language */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-gray-900">{t.language}</h2>
            </div>
            <div className="flex gap-2">
              {['el', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLocale(lang)
                    document.cookie = `locale=${lang};path=/;max-age=31536000`
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    locale === lang
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang === 'el' ? '🇬🇷 Ελληνικά' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-900">{t.personalInfo}</h2>
            </div>
            <div className="space-y-3">
              <Input
                label={t.name}
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
              />
              <Input
                label={t.dateOfBirth}
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update('date_of_birth', e.target.value)}
              />
              <Select
                label={t.gender}
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                options={[
                  { value: 'male', label: t.male },
                  { value: 'female', label: t.female },
                  { value: 'other', label: t.other },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t.height}
                  type="number"
                  value={form.height_cm}
                  onChange={(e) => update('height_cm', e.target.value)}
                  placeholder="170"
                />
                <Input
                  label={t.weight}
                  type="number"
                  value={form.current_weight_kg}
                  onChange={(e) => update('current_weight_kg', e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900">{t.goals}</h2>
            </div>
            <div className="space-y-3">
              <Select
                label={t.goal}
                value={form.goal}
                onChange={(e) => update('goal', e.target.value)}
                options={[
                  { value: 'lose', label: t.goals_lose },
                  { value: 'maintain', label: t.goals_maintain },
                  { value: 'gain', label: t.goals_gain },
                ]}
              />
              <Select
                label={t.activityLevel}
                value={form.activity_level}
                onChange={(e) => update('activity_level', e.target.value)}
                options={[
                  { value: 'sedentary', label: t.activity_sedentary },
                  { value: 'light', label: t.activity_light },
                  { value: 'moderate', label: t.activity_moderate },
                  { value: 'active', label: t.activity_active },
                  { value: 'very_active', label: t.activity_very_active },
                ]}
              />
              <Input
                label={t.targetWeight}
                type="number"
                value={form.target_weight_kg}
                onChange={(e) => update('target_weight_kg', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">{t.settings}</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Input
                  label={`${t.calorieGoal} (${locale === 'el' ? 'Υπολογισμένο' : 'Estimated'}: ${estimatedCalories} kcal)`}
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                />
              </div>
              <Input
                label={t.waterGoal}
                type="number"
                value={form.daily_water_goal_ml}
                onChange={(e) => update('daily_water_goal_ml', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleSave}>
          {tCommon.save}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-red-500"
          onClick={() => setProfile(null)}
        >
          <LogOut className="w-4 h-4" />
          {locale === 'el' ? 'Επαναφορά δεδομένων' : 'Reset data'}
        </Button>
      </div>
    </AppShell>
  )
}
