/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch public berita (no authentication required)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const slug = searchParams.get("slug")
        const limit = searchParams.get("limit")
        const jenis = searchParams.get("jenis")

        if (slug) {
            // Get single berita by slug
            const berita = await prisma.berita.findFirst({
                where: {
                    slug: slug,
                    aktif: true,
                    jenis: "internal", // Only internal berita have slugs
                },
            })

            if (!berita) {
                return NextResponse.json({ error: "Berita not found" }, { status: 404 })
            }

            return NextResponse.json(berita)
        } else {
            // Get list of public berita
            const where: any = {
                aktif: true,
            }

            if (jenis) {
                where.jenis = jenis
            }

            const berita = await prisma.berita.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                take: limit ? Number.parseInt(limit) : undefined,
                select: {
                    id: true,
                    judul: true,
                    konten: true,
                    gambar: true,
                    slug: true,
                    linkUrl: true,
                    jenis: true,
                    excerpt: true,
                    author: true,
                    tags: true,
                    tanggal: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            return NextResponse.json(berita)
        }
    } catch (error) {
        console.error("Error fetching public berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
