"use client"

import { Home, School, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar"

const menuItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "Fakultas",
        url: "/fakultas",
        icon: School,
    },
    {
        title: "Program Studi",
        url: "/program-studi",
        icon: BookOpen,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar className="h-screen">
            <SidebarHeader className="border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 px-4 py-4 bg-white">
                    <Image src="/logo.ico" alt="Logo" width={36} height={36} className="h-9 w-9" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">SALUT Dashboard</h2>
                        <p className="text-sm text-gray-600">Sistem Akademik</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4 bg-white flex-1">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-700 font-medium">Menu Utama</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-800 data-[active=true]:font-semibold transition-colors duration-200"
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
