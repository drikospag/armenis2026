'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Leaf } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useStore } from '@/hooks/useStore'
import { ToastProvider, useToast } from '@/components/ui/toast'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

function RegisterForm() {
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    full_name: '', email: '', password: '',
    gender: 'male', date_of_birth: '', height_cm: '', current_weight_kg: '',
    target_weight_kg: '', goal: 'maintain', activity_level: 'moderate',
  })
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { locale, setProfile } = useStore()
  const { showToast } = useToast()
  const t = locale === 'el' ? { ...elMessages.auth, ...elMessages.profile } : { ...enMessages.auth, ...enMessages.profile }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => {
      setProfile({
        id: 'user-' + Date.now(),
        full_name: form.full_name,
        gender: form.gender as 'male' | 'female' | 'other',
        date_of_birth: form.date_of_birth || undefined,
        height_cm: parseFloat(form.height_cm) || undefined,
        current_weight_kg: parseFloat(form.current_weight_kg) || undefined,
        target_weight_kg: parseFloat(form.target_weight_kg) || undefined,
        goal: form.goal as 'lose' | 'maintain' | 'gain',
        activity_level: form.activity_level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        daily_calorie_goal: 2000,
        daily_water_goal_ml: 2000,
      })
      router.push('/dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.registerTitle}</h1>
          <p className="text-gray-500 mt-2">{t.registerSubtitle}</p>

          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-6 bg-green-500' : s < step ? 'w-2 bg-green-300' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Input label={t.fullName} value={form.full_name} onChange={(e) => update('full_name', e.target.value)} icon={<User className="w-4 h-4" />} />
            <Input label={t.email} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} icon={<Mail className="w-4 h-4" />} />
            <Input label={t.password} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} icon={<Lock className="w-4 h-4" />} />
            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              {locale === 'el' ? 'Συνέχεια' : 'Continue'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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
            <Input label={t.dateOfBirth} type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.height} type="number" value={form.height_cm} onChange={(e) => update('height_cm', e.target.value)} placeholder="170" />
              <Input label={t.weight} type="number" value={form.current_weight_kg} onChange={(e) => update('current_weight_kg', e.target.value)} placeholder="70" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>{locale === 'el' ? 'Πίσω' : 'Back'}</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>{locale === 'el' ? 'Συνέχεια' : 'Continue'}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
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
            <Input label={t.targetWeight} type="number" value={form.target_weight_kg} onChange={(e) => update('target_weight_kg', e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>{locale === 'el' ? 'Πίσω' : 'Back'}</Button>
              <Button className="flex-1" disabled={loading} onClick={handleFinish}>
                {loading ? '...' : (locale === 'el' ? 'Ολοκλήρωση' : 'Finish')}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-green-500 font-semibold hover:underline">
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <ToastProvider>
      <RegisterForm />
    </ToastProvider>
  )
}
