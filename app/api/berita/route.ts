import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// Verify JWT token
function verifyToken(request: NextRequest) {
    const token = request.cookies.get("token")?.value

    if (!token) {
        return null
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        return decoded
    } catch (error) {
        console.error("Token verification failed:", error)
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const berita = await prisma.berita.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(berita)
    } catch (error) {
        console.error("Error fetching berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = verifyToken(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            judul,
            konten,
            kontenHtml,
            gambar,
            slug,
            linkUrl,
            jenis,
            excerpt,
            metaTitle,
            metaDescription,
            tags,
            author,
            tampilDiCarousel,
            aktif,
        } = body

        // Validate required fields
        if (!judul || !gambar || !jenis) {
            return NextResponse.json({ error: "Judul, gambar, dan jenis berita harus diisi" }, { status: 400 })
        }

        if (jenis === "internal" && !kontenHtml) {
            return NextResponse.json({ error: "Konten HTML harus diisi untuk berita internal" }, { status: 400 })
        }

        if (jenis === "eksternal" && (!konten || !linkUrl)) {
            return NextResponse.json({ error: "Konten dan link URL harus diisi untuk berita eksternal" }, { status: 400 })
        }

        // Generate slug if not provided (for internal news)
        let finalSlug = slug
        if (jenis === "internal" && !slug) {
            finalSlug = judul
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
        }

        // Check if slug already exists (for internal news)
        if (jenis === "internal" && finalSlug) {
            const existingBerita = await prisma.berita.findUnique({
                where: { slug: finalSlug },
            })

            if (existingBerita) {
                finalSlug = `${finalSlug}-${Date.now()}`
            }
        }

        const berita = await prisma.berita.create({
            data: {
                judul,
                konten: jenis === "internal" ? kontenHtml : konten,
                gambar,
                slug: finalSlug || "",
                linkUrl: jenis === "eksternal" ? linkUrl : null,
                jenis,
                excerpt: excerpt || "",
                metaTitle: metaTitle || judul,
                metaDescription: metaDescription || "",
                tags: tags || "",
                author: author || "",
                tanggal: new Date().toISOString(),
                tampilDiCarousel: tampilDiCarousel ?? false,
                aktif: aktif ?? true,
            },
        })

        return NextResponse.json(berita, { status: 201 })
    } catch (error) {
        console.error("Error creating berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = verifyToken(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            id,
            judul,
            konten,
            kontenHtml,
            gambar,
            slug,
            linkUrl,
            jenis,
            excerpt,
            metaTitle,
            metaDescription,
            tags,
            author,
            tampilDiCarousel,
            aktif,
        } = body

        if (!id) {
            return NextResponse.json({ error: "ID berita harus disediakan" }, { status: 400 })
        }

        // Validate required fields
        if (!judul || !gambar || !jenis) {
            return NextResponse.json({ error: "Judul, gambar, dan jenis berita harus diisi" }, { status: 400 })
        }

        if (jenis === "internal" && !kontenHtml) {
            return NextResponse.json({ error: "Konten HTML harus diisi untuk berita internal" }, { status: 400 })
        }

        if (jenis === "eksternal" && (!konten || !linkUrl)) {
            return NextResponse.json({ error: "Konten dan link URL harus diisi untuk berita eksternal" }, { status: 400 })
        }

        // Check if slug already exists (for internal news, excluding current item)
        if (jenis === "internal" && slug) {
            const existingBerita = await prisma.berita.findFirst({
                where: {
                    slug: slug,
                    NOT: { id: id },
                },
            })

            if (existingBerita) {
                return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 })
            }
        }

        const berita = await prisma.berita.update({
            where: { id },
            data: {
                judul,
                konten: jenis === "internal" ? kontenHtml : konten,
                gambar,
                slug: slug || "",
                linkUrl: jenis === "eksternal" ? linkUrl : null,
                jenis,
                excerpt: excerpt || "",
                metaTitle: metaTitle || judul,
                metaDescription: metaDescription || "",
                tags: tags || "",
                author: author || "",
                tampilDiCarousel: tampilDiCarousel ?? false,
                aktif: aktif ?? true,
            },
        })

        return NextResponse.json(berita)
    } catch (error) {
        console.error("Error updating berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = verifyToken(request)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID berita harus disediakan" }, { status: 400 })
        }

        await prisma.berita.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Berita berhasil dihapus" })
    } catch (error) {
        console.error("Error deleting berita:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
