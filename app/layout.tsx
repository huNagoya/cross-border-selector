import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '跨境选品分析师',
  description: 'AI 驱动的跨境电商智能选品分析工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
