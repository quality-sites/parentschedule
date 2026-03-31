import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthProvider from '../components/AuthProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parent Schedule',
  description: 'A dynamic rules-engine for shared custody schedules.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <AuthProvider>
          <div className="print:hidden">
            <Header />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <div className="print:hidden">
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

