/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Seed data brosur dengan gambar sample
export async function POST(req: NextRequest) {
    try {
        // Hapus brosur lama jika ada
        await prisma.brosur.deleteMany()

        // Buat brosur baru dengan data sample
        const brosur = await prisma.brosur.create({
            data: {
                imageUrl: "https://res.cloudinary.com/dutynt79z/image/upload/salut-soul/brosur/placeholder_brosur.png",
                linkUrl: "https://admisi-sia.ut.ac.id/",
                aktif: true,
            },
        })

        return NextResponse.json(
            {
                message: "Brosur sample berhasil dibuat",
                data: brosur,
            },
            { status: 201 },
        )
    } catch (error) {
        console.error("Error seeding brosur:", error)
        return NextResponse.json({ error: "Failed to seed brosur" }, { status: 500 })
    }
}
