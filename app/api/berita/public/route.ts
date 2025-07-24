/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const slug = searchParams.get("slug")
        const carousel = searchParams.get("carousel")
        const limit = searchParams.get("limit")
        const page = searchParams.get("page")
        const tag = searchParams.get("tag")

        // If requesting carousel items
        if (carousel === "true") {
            const berita = await prisma.berita.findMany({
                where: {
                    aktif: true,
                    tampilDiCarousel: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit ? Number.parseInt(limit) : 10,
            })

            // Convert HTML content to plain text for carousel display
            const processedBerita = berita.map((item) => ({
                ...item,
                konten: item.jenis === "internal" ? stripHtml(item.konten).substring(0, 200) + "..." : item.konten,
            }))

            return NextResponse.json(processedBerita)
        }

        // If requesting specific article by slug
        if (slug) {
            const berita = await prisma.berita.findFirst({
                where: {
                    slug: slug,
                    aktif: true,
                },
            })

            if (!berita) {
                return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 })
            }

            return NextResponse.json(berita)
        }

        // General public listing with pagination and filtering
        const pageNumber = page ? Number.parseInt(page) : 1
        const pageSize = limit ? Number.parseInt(limit) : 10
        const skip = (pageNumber - 1) * pageSize

        const where: any = {
            aktif: true,
        }

        if (tag) {
            where.tags = {
                contains: tag,
            }
        }

        const [berita, total] = await Promise.all([
            prisma.berita.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: pageSize,
            }),
            prisma.berita.count({ where }),
        ])

        return NextResponse.json({
            data: berita,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        })
    } catch (error) {
        console.error("Error fetching public berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
        .replace(/&amp;/g, "&") // Replace &amp; with &
        .replace(/&lt;/g, "<") // Replace &lt; with <
        .replace(/&gt;/g, ">") // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/&#39;/g, "'") // Replace &#39; with '
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim()
}
