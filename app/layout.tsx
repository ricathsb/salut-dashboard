import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SALUT Dashboard - Sistem Akademik",
  description: "Sistem Akademik Lengkap untuk Universitas Terbuka",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full light" data-theme="light">
      <head>
        <link rel="icon" href="/logo.ico" sizes="any" />
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/logo.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light mode
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
              document.documentElement.setAttribute('data-theme', 'light');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full overflow-hidden bg-white`}>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-gray-50">
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col min-h-0 bg-gray-50">
              <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4 bg-white shadow-sm">
                <SidebarTrigger className="-ml-1 text-gray-700 hover:bg-gray-100" />
                <div className="h-4 w-px bg-gray-300" />
              </header>
              <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}
