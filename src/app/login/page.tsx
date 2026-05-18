'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Leaf } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useStore } from '@/hooks/useStore'
import { ToastProvider, useToast } from '@/components/ui/toast'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { locale, setProfile } = useStore()
  const { showToast } = useToast()
  const t = locale === 'el' ? elMessages.auth : enMessages.auth

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Demo login - bypass auth for local use
    setTimeout(() => {
      setProfile({ id: 'demo-user', full_name: email.split('@')[0] || 'User' })
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
          <h1 className="text-3xl font-bold text-gray-900">{t.loginTitle}</h1>
          <p className="text-gray-500 mt-2">{t.loginSubtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={t.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label={t.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            disabled={loading}
          >
            {loading ? (locale === 'el' ? 'Σύνδεση...' : 'Signing in...') : t.signIn}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {t.noAccount}{' '}
            <Link href="/register" className="text-green-500 font-semibold hover:underline">
              {t.signUp}
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setProfile({ id: 'demo-user', full_name: 'Demo User' })
              router.push('/dashboard')
            }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            {locale === 'el' ? 'Συνέχεια χωρίς λογαριασμό' : 'Continue without account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  )
}
