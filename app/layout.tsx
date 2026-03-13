import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin", "cyrillic"], 
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: 'Тест-платформа | Платформа тестовых заданий',
  description: 'Платформа для создания и прохождения тестовых заданий по текстам и видео',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
