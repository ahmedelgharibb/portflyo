import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://portflyo-blond.vercel.app'),
  title: 'Dr. Sarah Johnson - Mathematics Educator',
  description: 'Professional portfolio of Dr. Sarah Johnson, Ph.D. in Mathematics Education with over 12 years of teaching experience.',
  keywords: 'mathematics teacher, education, online teaching, exam preparation',
  openGraph: {
    title: 'Dr. Sarah Johnson - Mathematics Educator',
    description: 'Professional portfolio of Dr. Sarah Johnson, Ph.D. in Mathematics Education with over 12 years of teaching experience.',
    images: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=630&fit=crop'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 