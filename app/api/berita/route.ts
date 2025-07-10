/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Ambil semua data berita
export async function GET() {
    try {
        const berita = await prisma.berita.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(berita)
    } catch (error) {
        console.error("Error fetching berita:", error)
        return NextResponse.json({ error: "Failed to fetch berita" }, { status: 500 })
    }
}

// POST - Buat berita baru
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { judul, konten, gambar, slug, linkUrl, aktif } = body

        const berita = await prisma.berita.create({
            data: {
                judul,
                konten,
                gambar,
                slug,
                linkUrl,
                aktif: aktif ?? true,
            },
        })

        return NextResponse.json(berita, { status: 201 })
    } catch (error: any) {
        console.error("Error creating berita:", error)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create berita" }, { status: 500 })
    }
}

// PUT - Update berita
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, judul, konten, gambar, slug, linkUrl, aktif } = body

        const berita = await prisma.berita.update({
            where: { id },
            data: {
                judul,
                konten,
                gambar,
                slug,
                linkUrl,
                aktif,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(berita)
    } catch (error: any) {
        console.error("Error updating berita:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 })
        }
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update berita" }, { status: 500 })
    }
}

// DELETE berita
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        await prisma.berita.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Berita deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting berita:", error)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to delete berita" }, { status: 500 })
    }
}
