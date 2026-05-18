import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'greek'] })

export const metadata: Metadata = {
  title: 'NutriTrack - Παρακολούθηση Θερμίδων',
  description: 'Παρακολουθήστε τη διατροφή σας, ασκήσεις και στόχους υγείας',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="el" className={inter.className}>
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  )
}
