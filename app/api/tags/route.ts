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
        const { searchParams } = new URL(request.url)
        const publicAccess = searchParams.get("public")

        // Allow public access for tag listing
        if (!publicAccess) {
            const user = verifyToken(request)
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
        }

        const tags = await prisma.tag.findMany({
            where: {
                aktif: true,
            },
            orderBy: {
                nama: "asc",
            },
        })

        return NextResponse.json(tags)
    } catch (error) {
        console.error("Error fetching tags:", error)
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
        const { nama, warna } = body

        if (!nama) {
            return NextResponse.json({ error: "Nama tag harus diisi" }, { status: 400 })
        }

        // Generate slug from nama
        const slug = nama
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")

        // Check if tag already exists
        const existingTag = await prisma.tag.findFirst({
            where: {
                OR: [{ nama: nama }, { slug: slug }],
            },
        })

        if (existingTag) {
            return NextResponse.json({ error: "Tag sudah ada" }, { status: 400 })
        }

        const tag = await prisma.tag.create({
            data: {
                nama,
                slug,
                warna: warna || "#3b82f6",
                aktif: true,
            },
        })

        return NextResponse.json(tag, { status: 201 })
    } catch (error) {
        console.error("Error creating tag:", error)
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
            return NextResponse.json({ error: "ID tag harus disediakan" }, { status: 400 })
        }

        await prisma.tag.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Tag berhasil dihapus" })
    } catch (error) {
        console.error("Error deleting tag:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
