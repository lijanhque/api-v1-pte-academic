import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { NonceWrapper } from '@/components/nonce-wrapper'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Pedagogists PTE',
  description:
    'PTE Academic preparation platform with AI-powered practice and scoring.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

// Font configuration - uses system fonts with CSS variable for flexibility
// In production with Google Fonts access, you can re-enable:
// import { Manrope } from 'next/font/google'
// const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-manrope' })
const fontClassName = 'font-sans'
const fontVariable = ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariable} suppressHydrationWarning>
      <body className={`min-h-[100dvh] ${fontClassName} antialiased`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <NonceWrapper>
            {children}
            <Toaster />
          </NonceWrapper>
        </Suspense>
      </body>
    </html>
  )
}
