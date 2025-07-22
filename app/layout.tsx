import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { LayoutWrapper } from "@/components/layout-wrapper"

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
      <LayoutWrapper>{children}</LayoutWrapper>
      <Toaster />
      </body>
      </html>
  )
}
