/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Seed data berita dengan data sample
export async function POST(req: NextRequest) {
    try {
        // Buat berita baru dengan data sample
        const berita = await prisma.berita.create({
            data: {
                judul: "Pendaftaran Mahasiswa Baru Universitas Terbuka",
                konten:
                    "Universitas Terbuka membuka pendaftaran mahasiswa baru untuk tahun akademik 2024/2025. Pendaftaran dapat dilakukan secara online melalui website resmi UT.",
                gambar: "https://res.cloudinary.com/dutynt79z/image/upload/v1/berita/sample_berita.jpg",
                slug: "pendaftaran-mahasiswa-baru-ut",
                linkUrl: "https://admisi-sia.ut.ac.id/",
                aktif: true,
            },
        })

        return NextResponse.json(
            {
                message: "Berita sample berhasil dibuat",
                data: berita,
            },
            { status: 201 },
        )
    } catch (error) {
        console.error("Error seeding berita:", error)
        return NextResponse.json({ error: "Failed to seed berita" }, { status: 500 })
    }
}
