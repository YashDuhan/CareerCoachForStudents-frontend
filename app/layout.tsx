import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Career Coach',
  description: 'AI-powered career guidance and resume analysis',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
