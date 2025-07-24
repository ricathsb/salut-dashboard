import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers" // Import headers for dynamic host detection
import BeritaDetailPageClient from "./BeritaDetailPageClient"

interface BeritaDetailPageProps {
    params: {
        slug: string
    }
}

async function getBerita(slug: string) {
    try {
        const headersList = await headers() // Await the headers() call
        const host = headersList.get("host") || "localhost:3000" // Dapatkan host dari header, fallback ke localhost
        // Tentukan protokol: https untuk produksi, http untuk pengembangan lokal
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
        const baseUrl = `${protocol}://${host}`

        const response = await fetch(`${baseUrl}/api/berita/public?slug=${slug}`, {
            cache: "no-store", // Pastikan data tidak disimpan dalam cache
        })

        if (!response.ok) {
            // Jika respons 404, kembalikan null agar notFound() dipanggil
            if (response.status === 404) {
                return null
            }
            console.error(`Error fetching berita: ${response.status} ${response.statusText}`)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching berita:", error)
        return null
    }
}

export async function generateMetadata({ params }: BeritaDetailPageProps): Promise<Metadata> {
    const { slug } = params
    const berita = await getBerita(slug)

    if (!berita) {
        return {
            title: "Berita Tidak Ditemukan",
            description: "Berita yang Anda cari tidak ditemukan",
        }
    }

    // Dapatkan host dan protokol lagi untuk membuat URL gambar absolut
    const headersList = await headers() // Await the headers() call
    const host = headersList.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const currentDomain = `${protocol}://${host}`

    // Buat URL gambar absolut untuk metadata Open Graph dan Twitter Card
    const imageUrl = berita.gambar
        ? berita.gambar.startsWith("http://") || berita.gambar.startsWith("https://")
            ? berita.gambar // Jika sudah URL absolut
            : `${currentDomain}${berita.gambar.startsWith("/") ? "" : "/"}${berita.gambar}` // Jika URL relatif
        : undefined

    return {
        title: berita.metaTitle || berita.judul,
        description: berita.metaDescription || berita.excerpt || berita.konten.substring(0, 160),
        openGraph: {
            title: berita.metaTitle || berita.judul,
            description: berita.metaDescription || berita.excerpt || berita.konten.substring(0, 160),
            images: imageUrl ? [imageUrl] : [],
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
            images: imageUrl ? [imageUrl] : [],
        },
    }
}

export default async function BeritaDetailPage({ params }: BeritaDetailPageProps) {
    const { slug } = params
    const berita = await getBerita(slug)

    if (!berita) {
        notFound() // Tampilkan halaman 404 jika berita tidak ditemukan
    }

    return <BeritaDetailPageClient berita={berita} />
}
