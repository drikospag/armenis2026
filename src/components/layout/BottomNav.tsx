'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Dumbbell, Droplets, Scale, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import elMessages from '@/messages/el.json'
import enMessages from '@/messages/en.json'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/diary', icon: BookOpen, key: 'diary' },
  { href: '/exercise', icon: Dumbbell, key: 'exercise' },
  { href: '/water', icon: Droplets, key: 'water' },
  { href: '/weight', icon: Scale, key: 'weight' },
  { href: '/profile', icon: User, key: 'profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const locale = useStore((s) => s.locale)
  const t = locale === 'el' ? elMessages.nav : enMessages.nav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, key }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all',
                isActive
                  ? 'text-green-500'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">
                {t[key as keyof typeof t]}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
