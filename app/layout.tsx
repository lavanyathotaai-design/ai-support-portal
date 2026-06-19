import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'SupportDesk AI',
  description: 'AI-powered support ticket portal',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <SessionProvider session={session}>
          {session ? (
            <div className="flex">
              <Sidebar userEmail={session.user?.email || ''} />
              <main className="flex-1 p-6 max-w-5xl">{children}</main>
            </div>
          ) : (
            children
          )}
        </SessionProvider>
      </body>
    </html>
  )
}