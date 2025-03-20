import './globals.css'
import type { Metadata } from 'next'
import { Josefin_Sans } from 'next/font/google'

const josefin = Josefin_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-josefin',
})

export const metadata: Metadata = {
  title: 'PowerNI Market Insights',
  description: 'Energy Market Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={josefin.variable}>
      <body className={`${josefin.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}