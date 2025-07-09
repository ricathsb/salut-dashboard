import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Ambil data brosur
export async function GET() {
    try {
        const brosur = await prisma.brosur.findFirst()
        return NextResponse.json(brosur)
    } catch (error) {
        console.error("Error fetching brosur:", error)
        return NextResponse.json({ error: "Failed to fetch brosur" }, { status: 500 })
    }
}

// POST - Buat brosur baru
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { imageUrl, linkUrl, aktif } = body

        // Hapus brosur lama jika ada (karena hanya boleh ada 1)
        await prisma.brosur.deleteMany()

        const brosur = await prisma.brosur.create({
            data: {
                imageUrl,
                linkUrl,
                aktif: aktif ?? true,
            },
        })

        return NextResponse.json(brosur, { status: 201 })
    } catch (error) {
        console.error("Error creating brosur:", error)
        return NextResponse.json({ error: "Failed to create brosur" }, { status: 500 })
    }
}

// PUT - Update brosur
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { imageUrl, linkUrl, aktif } = body

        // Cari brosur yang ada
        const existingBrosur = await prisma.brosur.findFirst()

        if (!existingBrosur) {
            // Jika tidak ada, buat baru
            const brosur = await prisma.brosur.create({
                data: {
                    imageUrl,
                    linkUrl,
                    aktif: aktif ?? true,
                },
            })
            return NextResponse.json(brosur)
        }

        // Update brosur yang ada
        const brosur = await prisma.brosur.update({
            where: { id: existingBrosur.id },
            data: {
                imageUrl,
                linkUrl,
                aktif,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(brosur)
    } catch (error) {
        console.error("Error updating brosur:", error)
        return NextResponse.json({ error: "Failed to update brosur" }, { status: 500 })
    }
}
