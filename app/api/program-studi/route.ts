/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all program studi
export async function GET() {
    try {
        const programStudi = await prisma.program_studi.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(programStudi)
    } catch (error) {
        console.error("Error fetching program studi:", error)
        return NextResponse.json({ error: "Failed to fetch program studi" }, { status: 500 })
    }
}

// POST create new program studi
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, nama, fakultas, jenjang, akreditasi, biayaSemester, deskripsi, isActive } = body

        const programStudi = await prisma.program_studi.create({
            data: {
                id,
                nama,
                fakultas,
                jenjang,
                akreditasi,
                biayaSemester: Number.parseInt(biayaSemester),
                deskripsi,
                isActive: isActive ?? true,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(programStudi, { status: 201 })
    } catch (error: any) {
        console.error("Error creating program studi:", error)
        return NextResponse.json({ error: "Failed to create program studi" }, { status: 500 })
    }
}

// PUT update program studi
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, nama, fakultas, jenjang, akreditasi, biayaSemester, deskripsi, isActive } = body

        const programStudi = await prisma.program_studi.update({
            where: { id },
            data: {
                nama,
                fakultas,
                jenjang,
                akreditasi,
                biayaSemester: Number.parseInt(biayaSemester),
                deskripsi,
                isActive,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(programStudi)
    } catch (error: any) {
        console.error("Error updating program studi:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Program studi tidak ditemukan" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to update program studi" }, { status: 500 })
    }
}

// DELETE program studi
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await prisma.program_studi.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Program studi deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting program studi:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Program studi tidak ditemukan" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to delete program studi" }, { status: 500 })
    }
}
