import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BeritaDetailPageClient from "./BeritaDetailPageClient"

interface BeritaDetailPageProps {
    params: Promise<{
        slug: string
    }>
}

async function getBerita(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        const response = await fetch(`${baseUrl}/api/berita/public?slug=${slug}`, {
            cache: "no-store",
        })

        if (!response.ok) {
            return null
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching berita:", error)
        return null
    }
}

export async function generateMetadata({ params }: BeritaDetailPageProps): Promise<Metadata> {
    const { slug } = await params
    const berita = await getBerita(slug)

    if (!berita) {
        return {
            title: "Berita Tidak Ditemukan",
            description: "Berita yang Anda cari tidak ditemukan",
        }
    }

    return {
        title: berita.metaTitle || berita.judul,
        description: berita.metaDescription || berita.excerpt || berita.konten.substring(0, 160),
        openGraph: {
            title: berita.metaTitle || berita.judul,
            description: berita.metaDescription || berita.excerpt || berita.konten.substring(0, 160),
            images: berita.gambar ? [berita.gambar] : [],
            type: "article",
            publishedTime: berita.createdAt,
            modifiedTime: berita.updatedAt,
            authors: berita.author ? [berita.author] : [],
            tags: berita.tags ? berita.tags.split(",").map((tag: string) => tag.trim()) : [],
        },
        twitter: {
            card: "summary_large_image",
            title: berita.metaTitle || berita.judul,
            description: berita.metaDescription || berita.excerpt || berita.konten.substring(0, 160),
            images: berita.gambar ? [berita.gambar] : [],
        },
    }
}

export default async function BeritaDetailPage({ params }: BeritaDetailPageProps) {
    const { slug } = await params
    const berita = await getBerita(slug)

    if (!berita) {
        notFound()
    }

    return <BeritaDetailPageClient berita={berita} />
}
