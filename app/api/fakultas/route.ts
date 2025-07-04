/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all fakultas
export async function GET() {
    try {
        const fakultas = await prisma.fakultas.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(fakultas)
    } catch (error) {
        console.error("Error fetching fakultas:", error)
        return NextResponse.json({ error: "Failed to fetch fakultas" }, { status: 500 })
    }
}

// POST create new fakultas
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, nama, namaLengkap, deskripsi, akreditasi, isActive } = body

        const fakultas = await prisma.fakultas.create({
            data: {
                id,
                nama,
                namaLengkap,
                deskripsi,
                akreditasi,
                isActive: isActive ?? true,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(fakultas, { status: 201 })
    } catch (error: any) {
        console.error("Error creating fakultas:", error)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Nama fakultas sudah ada" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create fakultas" }, { status: 500 })
    }
}

// PUT update fakultas
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, nama, namaLengkap, deskripsi, akreditasi, isActive } = body

        const fakultas = await prisma.fakultas.update({
            where: { id },
            data: {
                nama,
                namaLengkap,
                deskripsi,
                akreditasi,
                isActive,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(fakultas)
    } catch (error: any) {
        console.error("Error updating fakultas:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Fakultas tidak ditemukan" }, { status: 404 })
        }
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Nama fakultas sudah ada" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update fakultas" }, { status: 500 })
    }
}

// DELETE fakultas
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await prisma.fakultas.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Fakultas deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting fakultas:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Fakultas tidak ditemukan" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to delete fakultas" }, { status: 500 })
    }
}
