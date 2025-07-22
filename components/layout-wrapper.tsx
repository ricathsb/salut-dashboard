"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Hide sidebar and navigation for login page
    const isLoginPage = pathname === "/login"

    if (isLoginPage) {
        return <>{children}</>
    }

    return (
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
    )
}
